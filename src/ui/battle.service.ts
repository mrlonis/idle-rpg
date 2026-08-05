import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  type ActiveStatus,
  applyBattleResult,
  BATTLE_TICK_MS,
  battleSeed,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  MAX_ENERGY,
  type Numeric,
  type Row,
  type Side,
  simulateBattle,
  type StageData,
  ZERO,
} from '../core';
import { AUTO_BATTLE_UNLOCK_CLEARS, STAGES } from '../data';
import { COMBAT } from './content';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';

/**
 * How often the animator is stepped. This is a **presentation** clock: it decides how smoothly
 * a fight is narrated, and nothing about the fight itself.
 */
const ANIMATION_STEP_MS = 100;

/**
 * Ceiling on one animation step, in real milliseconds.
 *
 * A hidden tab throttles timers, and returning from one delivers a single enormous delta. This
 * is the same class of guard the sim loop needs, for the same reason — without it, coming back
 * to the app blasts through the whole log at once and skips the fight the player was watching.
 * With it, playback simply resumes where it was.
 */
const MAX_STEP_MS = 1000;

/** Log entries kept for display. The full log lives on the result; this is what fits on screen. */
const VISIBLE_LOG_LENGTH = 6;

/** Playback speeds offered to the player. */
export const PLAYBACK_SPEEDS = [1, 2, 4] as const;

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** A stage named for display: which number it is on the ladder, and what it is called. */
export interface StageHeading {
  readonly name: string;
  readonly number: number;
}

/** A combatant as the view needs it: identity, live HP, and a ratio for the bar. */
export interface BattleCombatantView {
  readonly key: string;
  /**
   * Identity for `@for` tracking, unique to this battle rather than to this slot.
   *
   * `key` alone is positional (`enemy-0`), so it repeats every battle and Angular reuses the
   * same DOM node — which means the HP bar's width transition animates from the *previous*
   * fight's value, and every battle opens with bars sliding around. Scoping the tracking key to
   * the battle makes each fight a fresh set of rows, which is what it actually is.
   */
  readonly viewKey: string;
  readonly name: string;
  readonly side: Side;
  readonly row: Row;
  readonly faction: string;
  readonly hp: Numeric;
  readonly maxHp: Numeric;
  /** Remaining HP as a 0–1 fraction, for a progress bar. */
  readonly fraction: number;
  /** Current energy, 0–{@link MAX_ENERGY}. */
  readonly energy: number;
  /**
   * Energy as a 0–1 fraction, for the bar.
   *
   * Reports 0 for a combatant with no ultimate, which is what hides the bar. Every combatant
   * *has* energy since 8b — the bar is hidden because there is nothing to spend it on, not
   * because the pool is empty, and those were the same condition back when pools differed.
   */
  readonly energyFraction: number;
  /** Whether this combatant has an ultimate, and therefore a meter worth drawing. */
  readonly hasUltimate: boolean;
  /** Remaining absorb across every shield, for a bar segment over the HP bar. */
  readonly shield: Numeric;
  readonly statuses: readonly ActiveStatus[];
  /** Set while this combatant is the one taking a turn, for a highlight. */
  readonly isActing: boolean;
  readonly isDown: boolean;
}

/**
 * Resolves battles and narrates them.
 *
 * The division of labour is the whole point of this milestone. {@link fight} resolves a whole
 * fight **instantly and in full** into an event log, and this service then walks that log
 * against the wall clock so the player has something to watch.
 *
 * Combat is therefore not driven by the render tick, which is what makes playback speed nearly
 * free — 2x is one multiplication in {@link advance}, not a second combat implementation. It is
 * also why offline resolution and skipping will be cheap when they arrive.
 *
 * **A battle is started by the player, and only one kind of automation continues it.**
 * {@link setAuto} is the unlockable repeat: it re-enters stages until the party loses, and it is
 * the *only* thing that ever calls {@link fight} without a tap. The other feature the name
 * "auto-battle" suggests — the party visibly sparring behind the idle screen — is presentation
 * rather than simulation and is still deferred; it must never award anything.
 *
 * **The result is applied when the animation finishes, not when the battle resolves.** Applying
 * it up front would spoil every fight: the gold counter and the income rate would both jump the
 * instant the player tapped, announcing the outcome before the first blow landed. The cost is
 * that a battle abandoned mid-animation — by a reload, not by backgrounding, which merely pauses
 * — pays nothing. That is a fair trade: the player is watching, a fight lasts seconds, the save
 * stays exactly consistent with what was shown, and going again is one tap.
 *
 * It stayed a fair trade when auto-battle landed, because that loop is **foreground-only** and so
 * is attended too. What it did need is {@link settle} persisting at the end of every fight rather
 * than leaving the result to the next autosave — see the note there.
 */
@Service()
export class BattleService {
  private readonly game = inject(GameLoopService);
  private readonly roster = inject(RosterService);

  /** Playback rate. Applies mid-battle: the animator integrates elapsed time, so changing this
   * speeds up the remainder of the current fight rather than restarting it. */
  readonly playbackSpeed = signal<PlaybackSpeed>(1);

  /** The battle being narrated, or `null` before the first one has been resolved. */
  readonly result = signal<BattleResult | null>(null);

  /** The stage the battle on screen is being fought on. */
  readonly stage = signal<StageHeading | null>(null);

  /** Events that have played so far, most recent last. Trimmed to what the view shows. */
  readonly recentEvents = signal<readonly BattleEvent[]>([]);

  /** Set when the closing event plays, so the outcome is not spoiled before the fight ends. */
  readonly outcome = signal<BattleOutcome | null>(null);

  /** True while a battle is being narrated. The Fight control is inert for exactly this long. */
  readonly isFighting = signal(false);

  /**
   * True while the battle screen is the screen.
   *
   * Opened by {@link fight} and closed by {@link close}, so the screen's lifetime is the battle
   * session rather than a separate thing to keep in step. Deliberately not a route: everything
   * the battle screen shows lives in memory and cannot survive a reload, so it is a mode the
   * player is in, not a place they can link to.
   */
  readonly isOpen = signal(false);

  /**
   * True while auto-battle is running the loop.
   *
   * Session state, deliberately not saved. A flag that survived a reload would be a loop the
   * player armed yesterday resuming without them, which is the opposite of "foreground-only" —
   * and keeping it out of `GameState` is what lets this whole milestone ship without a save
   * migration.
   */
  readonly isAuto = signal(false);

  /**
   * Whether the run has earned auto-battle at all.
   *
   * Read off `clearedStages` rather than `stage`, because `stage` stops climbing at the top of
   * the ladder and would answer "no" forever for a run that had beaten everything.
   */
  readonly isAutoUnlocked = computed(
    () => (this.game.snapshot()?.clearedStages ?? 0) >= AUTO_BATTLE_UNLOCK_CLEARS,
  );

  /**
   * The stage an auto-battle run lost on, or `null`.
   *
   * A loss drops the player back to the idle screen — which means the board that explained the
   * loss is gone by the time they can read it. This is what the home screen says instead. Cleared
   * the moment another fight starts, because by then it is describing a run that is over.
   */
  readonly autoStoppedAt = signal<StageHeading | null>(null);

  /**
   * Closes the "auto-battle stopped" line on the home screen.
   *
   * The same clear {@link fight} performs on its way in, exposed for the player: the line
   * describes a run that has already ended, so there is nothing to preserve by keeping it up.
   *
   * Cleared on the service rather than hidden by the screen because `HomeView` is lazily routed
   * and re-created on every navigation, so a dismissal the component held would not survive a
   * trip to the roster and back.
   */
  dismissAutoStopped(): void {
    this.autoStoppedAt.set(null);
  }

  private readonly liveHp = signal<ReadonlyMap<string, Numeric>>(new Map());
  private readonly liveEnergy = signal<ReadonlyMap<string, number>>(new Map());
  private readonly liveStatuses = signal<ReadonlyMap<string, readonly ActiveStatus[]>>(new Map());
  private readonly acting = signal<string | null>(null);

  /** Monotonic counter over battles narrated this session. Only identity matters, not the value. */
  private readonly battleId = signal(0);

  private playbackMs = 0;
  private cursor = 0;
  private lastAt = 0;
  private stepId: ReturnType<typeof setInterval> | undefined;

  /** Live combatant rows, party first, in slot order. */
  readonly combatants = computed<readonly BattleCombatantView[]>(() => {
    const result = this.result();
    if (result === null) {
      return [];
    }
    const hp = this.liveHp();
    const energy = this.liveEnergy();
    const statuses = this.liveStatuses();
    const acting = this.acting();
    const battle = this.battleId();

    return result.roster.map((combatant) => {
      const current = hp.get(combatant.key) ?? combatant.maxHp;
      const currentEnergy = energy.get(combatant.key) ?? combatant.energy;
      const held = statuses.get(combatant.key) ?? [];
      return {
        key: combatant.key,
        viewKey: `${battle}:${combatant.key}`,
        name: combatant.name,
        side: combatant.side,
        row: combatant.row,
        faction: combatant.faction,
        hp: current,
        maxHp: combatant.maxHp,
        fraction: fractionOf(current, combatant.maxHp),
        energy: currentEnergy,
        energyFraction: combatant.ultimate ? Math.min(currentEnergy / MAX_ENERGY, 1) : 0,
        hasUltimate: combatant.ultimate,
        shield: shieldOf(held),
        statuses: held,
        isActing: acting === combatant.key && current.gt(ZERO),
        isDown: current.lte(0),
      };
    });
  });

  readonly partyFront = computed(() => this.rank('ally', 'front'));
  readonly partyBack = computed(() => this.rank('ally', 'back'));
  readonly foesFront = computed(() => this.rank('enemy', 'front'));
  readonly foesBack = computed(() => this.rank('enemy', 'back'));

  private rank(side: Side, row: Row): readonly BattleCombatantView[] {
    return this.combatants().filter((view) => view.side === side && view.row === row);
  }

  /**
   * The stage the next {@link fight} will enter, or `null` before the run has loaded.
   *
   * Read off the run rather than off the last battle, so after a win it names the stage ahead
   * and after a loss it names the one to try again. Distinct from {@link stage}, which stays
   * pointed at the fight currently on screen.
   */
  readonly nextStage = computed<StageHeading | null>(() => {
    const snapshot = this.game.snapshot();
    if (snapshot === null) {
      return null;
    }
    const { stage, number } = stageFor(snapshot.stage);
    return { name: stage.name, number };
  });

  /** Maps a combatant key to its display name, for narrating the log. */
  readonly names = computed<ReadonlyMap<string, string>>(() => {
    const roster = this.result()?.roster ?? [];
    return new Map(roster.map((combatant) => [combatant.key, combatant.name]));
  });

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    inject(DestroyRef).onDestroy(() => {
      this.stop();
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    });
  }

  /**
   * Switches auto-battle off the moment the app stops being the foreground.
   *
   * **This is the load-bearing half of "foreground-only", not a courtesy.** A hidden tab throttles
   * the animator to roughly 1Hz, and {@link MAX_STEP_MS} clamps each step to a second — so
   * playback keeps advancing in real time while nobody is watching, and an unattended loop would
   * climb the ladder in the background. Stages clearing while the player is away is precisely what
   * would make every idle rate non-constant across an offline window, which is the entire reason
   * `core/offline.ts` needs no segmented solver. Relaxing this re-opens milestone 5.
   *
   * The battle already in flight is left alone. It finishes, banks, and persists, and then nothing
   * follows it — which is what makes "losing the app costs the fight in flight and nothing else"
   * true rather than aspirational.
   *
   * Off rather than paused, deliberately: the toggle the player left on is visibly off when they
   * come back, so a loop that is running is always a loop they can see they started.
   */
  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.isAuto.set(false);
    }
  };

  /**
   * Fights the stage the run is on, then narrates it.
   *
   * The whole battle is resolved here, synchronously. What follows is replay: the outcome is
   * already decided and sitting in the log before the first frame of animation.
   *
   * Ignored while a battle is already playing, so a double tap cannot start two fights or
   * abandon one halfway. `nowMs` is passed in for the same reason it is everywhere else — the
   * clock lives at the edges, and a caller that supplies it can drive playback deterministically.
   *
   * Called by the player, and by {@link settle} when auto-battle is carrying the run forward.
   */
  fight(nowMs: number): void {
    const state = this.game.current;
    if (state === null || this.isFighting()) {
      return;
    }

    // Whatever stopped the last auto run is describing history the moment a new fight starts.
    this.autoStoppedAt.set(null);

    const { stage, number } = stageFor(state.stage);
    const result = simulateBattle(
      // The formation the player has chosen, with stats already scaled for level and rarity —
      // which is the whole reason the roster exists. An empty formation resolves as an
      // immediate defeat rather than being quietly substituted for the starters.
      this.roster.battleFormation(),
      stage,
      // A derived sub-stream: combat is reproducible and never advances `rng.calls`, so
      // replaying a battle cannot shift the pull sequence.
      battleSeed(state.rng.seed, stage.id, state.battleCount),
      COMBAT,
    );

    this.stage.set({ name: stage.name, number });
    this.result.set(result);
    this.liveHp.set(new Map(result.roster.map((combatant) => [combatant.key, combatant.maxHp])));
    // Empty, matching the simulation's opening state. An ultimate is a payoff, not an opener.
    this.liveEnergy.set(
      new Map(result.roster.map((combatant) => [combatant.key, combatant.energy])),
    );
    this.liveStatuses.set(new Map());
    this.acting.set(null);
    this.recentEvents.set([]);
    this.outcome.set(null);
    this.battleId.update((id) => id + 1);
    this.cursor = 0;
    this.playbackMs = 0;
    this.lastAt = nowMs;
    this.isFighting.set(true);
    this.isOpen.set(true);

    // The timer only runs while there is a fight to narrate. Between battles nothing is
    // scheduled at all, which is the honest shape of a game that waits for the player.
    //
    // Deliberately not gated on `document.visibilityState`. A backgrounded tab throttles this
    // to about 1Hz, and the step clamp already keeps that from skipping the fight, so the only
    // effect of letting it run is that the battle finishes rather than stalling half-played.
    this.stepId ??= setInterval(() => this.advance(Date.now()), ANIMATION_STEP_MS);
  }

  /**
   * Leaves the battle screen and clears the board behind it.
   *
   * Refuses while a fight is still playing. A battle is seconds long and can be sped up, so
   * there is nothing to escape from — and without the guard, closing mid-fight would silently
   * discard a battle the player was about to be paid for.
   */
  close(): void {
    if (this.isFighting()) {
      return;
    }
    // Leaving the battle screen ends the loop. Auto-battle is a thing the player is watching
    // happen, so it cannot outlive the screen it happens on.
    this.isAuto.set(false);
    this.isOpen.set(false);
    this.result.set(null);
    this.stage.set(null);
    this.outcome.set(null);
    this.recentEvents.set([]);
    this.liveHp.set(new Map());
    this.liveEnergy.set(new Map());
    this.liveStatuses.set(new Map());
    this.acting.set(null);
  }

  stop(): void {
    clearInterval(this.stepId);
    this.stepId = undefined;
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.playbackSpeed.set(speed);
  }

  /**
   * Turns the repeat loop on or off.
   *
   * Switching it on between fights starts the next one immediately, because a toggle that armed
   * something and then waited for a tap would be asking the player to do the thing they just
   * asked not to do. Switching it on mid-fight simply queues: the battle on screen finishes as
   * normal and the next one follows it.
   *
   * Refused before the run has earned it, and refused off the battle screen — the loop's own
   * stopping condition is a loss, and there is nowhere for a player who is not watching to see
   * one happen.
   *
   * `nowMs` is only read when starting a fight; the clock lives at the edges, as everywhere else.
   */
  setAuto(on: boolean, nowMs: number): void {
    if (!on) {
      this.isAuto.set(false);
      return;
    }
    if (!this.isAutoUnlocked() || !this.isOpen()) {
      return;
    }
    this.isAuto.set(true);
    if (!this.isFighting()) {
      this.fight(nowMs);
    }
  }

  /**
   * Advances narration to `nowMs`.
   *
   * Separate from the timer so playback can be driven deterministically in tests, exactly as
   * `GameLoopService.advance` is. Elapsed time is integrated rather than measured from a fixed
   * origin, which is what lets the speed change mid-fight without the playhead jumping.
   */
  advance(nowMs: number): void {
    if (!this.isFighting()) {
      this.lastAt = nowMs;
      return;
    }

    const delta = nowMs - this.lastAt;
    this.lastAt = nowMs;
    if (!Number.isFinite(delta) || delta <= 0) {
      return;
    }
    this.playbackMs += Math.min(delta, MAX_STEP_MS) * this.playbackSpeed();
    this.play(nowMs);
  }

  /**
   * Plays every event whose tick has now been reached.
   *
   * The animator's whole job is to walk the log; it never recomputes anything the simulation
   * already decided. Every mutable board value — HP, energy, statuses, whose turn it is — moves
   * only because an event said so, which is why the log carries turn starts and status
   * expiries at all. Anything the animator had to derive for itself would be a second
   * implementation of combat, and the two would drift.
   *
   * `nowMs` is carried through only so that {@link settle} can hand it to the fight auto-battle
   * starts next, keeping the follow-on battle on the same clock as the one that just ended.
   */
  private play(nowMs: number): void {
    const result = this.result();
    if (result === null) {
      this.isFighting.set(false);
      return;
    }

    const played: BattleEvent[] = [];
    let hp: Map<string, Numeric> | undefined;
    let energy: Map<string, number> | undefined;
    let statuses: Map<string, readonly ActiveStatus[]> | undefined;
    let acting: string | null | undefined;

    const setHp = (key: string, value: Numeric): void => {
      hp ??= new Map(this.liveHp());
      hp.set(key, value);
    };
    const setEnergy = (key: string, value: number): void => {
      energy ??= new Map(this.liveEnergy());
      energy.set(key, value);
    };
    const editStatuses = (
      key: string,
      change: (held: readonly ActiveStatus[]) => readonly ActiveStatus[],
    ): void => {
      statuses ??= new Map(this.liveStatuses());
      statuses.set(key, change(statuses.get(key) ?? []));
    };

    while (this.cursor < result.events.length) {
      const event = result.events[this.cursor];
      if (event.tick * BATTLE_TICK_MS > this.playbackMs) {
        break;
      }
      this.cursor++;
      // Turn markers drive the highlight but would drown the log — a fight is far more turns
      // than it is interesting moments.
      if (event.kind !== 'turn') {
        played.push(event);
      }

      switch (event.kind) {
        case 'turn':
          acting = event.combatant;
          setEnergy(event.combatant, event.energy);
          break;
        case 'cast':
          setEnergy(event.source, event.energy);
          break;
        case 'attack':
          setHp(event.target, event.targetHp);
          // One hit moves both meters: the attacker is credited for landing it and the target
          // for taking it. Both numbers ride on the event, so neither is re-derived here.
          setEnergy(event.source, event.sourceEnergy);
          setEnergy(event.target, event.targetEnergy);
          // A shield that absorbed part of the hit has shrunk by exactly that much. Replaying
          // the split here is what keeps the shield segment on the bar honest.
          if (event.absorbed.gt(ZERO)) {
            editStatuses(event.target, (held) => spendShields(held, event.absorbed));
          }
          break;
        case 'heal':
          setHp(event.target, event.targetHp);
          setEnergy(event.source, event.sourceEnergy);
          break;
        case 'tick-heal':
          setHp(event.target, event.targetHp);
          break;
        case 'tick-damage':
          setHp(event.target, event.targetHp);
          // A poison ticking against a barrier drains the barrier, exactly as an attack does.
          if (event.absorbed.gt(ZERO)) {
            editStatuses(event.target, (held) => spendShields(held, event.absorbed));
          }
          break;
        case 'status':
          editStatuses(event.target, (held) => [
            ...held.filter((status) => status.id !== event.status.id),
            event.status,
          ]);
          break;
        case 'status-expired':
          editStatuses(event.target, (held) =>
            held.filter((status) => status.id !== event.statusId),
          );
          break;
        case 'cleanse':
          editStatuses(event.target, (held) =>
            held.filter((status) => !event.removed.includes(status.id)),
          );
          break;
        case 'defeat':
          editStatuses(event.combatant, () => []);
          if (acting === event.combatant) {
            acting = null;
          }
          break;
        case 'end':
          this.outcome.set(event.outcome);
          acting = null;
          break;
        case 'miss':
        case 'status-resisted':
        case 'stunned':
          break;
      }
    }

    if (hp !== undefined) {
      this.liveHp.set(hp);
    }
    if (energy !== undefined) {
      this.liveEnergy.set(energy);
    }
    if (statuses !== undefined) {
      this.liveStatuses.set(statuses);
    }
    if (acting !== undefined) {
      this.acting.set(acting);
    }
    if (played.length > 0) {
      this.recentEvents.update((events) => [...events, ...played].slice(-VISIBLE_LOG_LENGTH));
    }

    if (this.cursor >= result.events.length) {
      this.settle(result, nowMs);
    }
  }

  /**
   * Banks a fully narrated battle, writes it to storage, and either stops or goes again.
   *
   * This is the only place the run is written, and it happens in the same pass that plays the
   * closing event — so the outcome the player reads and the gold, income and stage they are
   * credited with land together, never one before the other.
   *
   * **Persisting here rather than leaving it to the next autosave is auto-battle's one hard
   * requirement on the rest of the app.** Results reached `GameState` at this point already, but
   * only reached storage on `visibilitychange` or the thirty-second backstop — so a hard suspend
   * could lose several *completed* battles, which at 4x is most of a climb. Writing per battle is
   * what makes "losing the app costs the fight in flight and nothing else" a true statement
   * instead of an intention: there is no pause/resume state machine and nothing to reconcile on
   * the next launch, because everything already finished is already banked.
   *
   * A win goes again. Anything else ends the run and drops the player back to the idle screen,
   * with {@link autoStoppedAt} carrying out the stage that stopped them.
   */
  private settle(result: BattleResult, nowMs: number): void {
    this.isFighting.set(false);
    this.stop();
    this.playbackMs = 0;
    this.game.apply((state) => applyBattleResult(state, result, STAGES.length));
    void this.game.persist();

    if (!this.isAuto()) {
      return;
    }
    if (result.outcome === 'victory') {
      this.fight(nowMs);
      return;
    }

    // Read before closing: `close` clears the board, and the stage that ended the run is the one
    // thing worth carrying off it.
    const stoppedAt = this.stage();
    this.isAuto.set(false);
    this.close();
    this.autoStoppedAt.set(stoppedAt);
  }
}

/**
 * Resolves a run's stage number to the stage that will be fought.
 *
 * Clamped here rather than in `core/`, which cannot import `data/` and so has no way to know
 * how many stages exist. A save from a build with more content than this one still lands
 * somewhere sensible instead of on `undefined`.
 */
function stageFor(stage: number): { stage: StageData; number: number } {
  const clamped = Number.isFinite(stage)
    ? Math.min(Math.max(Math.floor(stage), 1), STAGES.length)
    : 1;
  return { stage: STAGES[clamped - 1], number: clamped };
}

/**
 * Remaining HP as a 0–1 fraction. `maxHp` is at least 1 by the time content is parsed.
 *
 * Full HP is short-circuited rather than divided. `Decimal` division of a value by itself is not
 * exactly 1 — 430/430 comes back as 0.9999999999999999 — and a bar that is imperceptibly short
 * at full health is the kind of thing that looks like a rendering bug forever.
 */
function fractionOf(hp: Numeric, maxHp: Numeric): number {
  if (hp.gte(maxHp)) {
    return 1;
  }
  const fraction = hp.div(maxHp).toNumber();
  if (!Number.isFinite(fraction)) {
    return 0;
  }
  return Math.max(fraction, 0);
}

/** Remaining absorb across every shield a combatant is holding. */
function shieldOf(statuses: readonly ActiveStatus[]): Numeric {
  let total = ZERO;
  for (const status of statuses) {
    if (status.kind === 'shield' && status.amount !== undefined) {
      total = total.add(status.amount);
    }
  }
  return total;
}

/**
 * Spends `absorbed` across a combatant's shields, oldest pool first.
 *
 * A deliberate mirror of `absorbDamage` in `core/battle/status.ts` — the same order, the same
 * "drop a spent pool" rule — because the animator has to arrive at the same board the
 * simulation did. It is not a second damage calculation: the amount was decided by the
 * simulation and carried on the event, and this only decides which badge it came out of.
 */
function spendShields(
  statuses: readonly ActiveStatus[],
  absorbed: Numeric,
): readonly ActiveStatus[] {
  const next: ActiveStatus[] = [];
  let remaining = absorbed;
  for (const status of statuses) {
    const pool = status.kind === 'shield' ? (status.amount ?? ZERO) : undefined;
    if (pool === undefined || remaining.lte(ZERO) || pool.lte(ZERO)) {
      next.push(status);
      continue;
    }
    const taken = pool.lt(remaining) ? pool : remaining;
    remaining = remaining.sub(taken);
    const left = pool.sub(taken);
    if (left.gt(ZERO)) {
      next.push({ ...status, amount: left });
    }
  }
  return next;
}
