import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  type ActiveStatus,
  applyBattleResult,
  BATTLE_TICK_MS,
  battleSeed,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  type Numeric,
  type Row,
  type Side,
  simulateBattle,
  type StageData,
  ZERO,
} from '../core';
import { STAGES } from '../data';
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
  readonly maxMp: number;
  readonly mp: number;
  /** Remaining MP as a 0–1 fraction. Zero-pool combatants report 0 and hide the bar. */
  readonly mpFraction: number;
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
 * **Battles are started by the player, one at a time.** Nothing fights on its own: the animator
 * is idle, and stays idle after a battle ends, until {@link fight} is called again. The two
 * kinds of automation the name "auto-battle" suggests — the party visibly sparring behind the
 * idle screen, and an unlockable that re-enters stages until the party loses — are later
 * milestones and neither is built here.
 *
 * **The result is applied when the animation finishes, not when the battle resolves.** Applying
 * it up front would spoil every fight: the gold counter and the income rate would both jump the
 * instant the player tapped, announcing the outcome before the first blow landed. The cost is
 * that a battle abandoned mid-animation — by a reload, not by backgrounding, which merely pauses
 * — pays nothing. That is a fair trade here in a way it would not be for an unattended loop: the
 * player is watching, a fight lasts seconds, the save stays exactly consistent with what was
 * shown, and going again is one tap.
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

  private readonly liveHp = signal<ReadonlyMap<string, Numeric>>(new Map());
  private readonly liveMp = signal<ReadonlyMap<string, number>>(new Map());
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
    const mp = this.liveMp();
    const statuses = this.liveStatuses();
    const acting = this.acting();
    const battle = this.battleId();

    return result.roster.map((combatant) => {
      const current = hp.get(combatant.key) ?? combatant.maxHp;
      const currentMp = mp.get(combatant.key) ?? combatant.maxMp;
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
        maxMp: combatant.maxMp,
        mp: currentMp,
        mpFraction: combatant.maxMp > 0 ? Math.min(currentMp / combatant.maxMp, 1) : 0,
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
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * Fights the stage the run is on, then narrates it.
   *
   * The whole battle is resolved here, synchronously. What follows is replay: the outcome is
   * already decided and sitting in the log before the first frame of animation.
   *
   * Ignored while a battle is already playing, so a double tap cannot start two fights or
   * abandon one halfway. `nowMs` is passed in for the same reason it is everywhere else — the
   * clock lives at the edges, and a caller that supplies it can drive playback deterministically.
   */
  fight(nowMs: number): void {
    const state = this.game.current;
    if (state === null || this.isFighting()) {
      return;
    }

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
    this.liveMp.set(new Map(result.roster.map((combatant) => [combatant.key, combatant.maxMp])));
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
    this.isOpen.set(false);
    this.result.set(null);
    this.stage.set(null);
    this.outcome.set(null);
    this.recentEvents.set([]);
    this.liveHp.set(new Map());
    this.liveMp.set(new Map());
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
    this.play();
  }

  /**
   * Plays every event whose tick has now been reached.
   *
   * The animator's whole job is to walk the log; it never recomputes anything the simulation
   * already decided. Every mutable board value — HP, MP, statuses, whose turn it is — moves
   * only because an event said so, which is why the log carries turn starts and status
   * expiries at all. Anything the animator had to derive for itself would be a second
   * implementation of combat, and the two would drift.
   */
  private play(): void {
    const result = this.result();
    if (result === null) {
      this.isFighting.set(false);
      return;
    }

    const played: BattleEvent[] = [];
    let hp: Map<string, Numeric> | undefined;
    let mp: Map<string, number> | undefined;
    let statuses: Map<string, readonly ActiveStatus[]> | undefined;
    let acting: string | null | undefined;

    const setHp = (key: string, value: Numeric): void => {
      hp ??= new Map(this.liveHp());
      hp.set(key, value);
    };
    const setMp = (key: string, value: number): void => {
      mp ??= new Map(this.liveMp());
      mp.set(key, value);
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
          setMp(event.combatant, event.mp);
          break;
        case 'cast':
          setMp(event.source, event.mp);
          setHp(event.source, event.hp);
          break;
        case 'attack':
          setHp(event.target, event.targetHp);
          // A shield that absorbed part of the hit has shrunk by exactly that much. Replaying
          // the split here is what keeps the shield segment on the bar honest.
          if (event.absorbed.gt(ZERO)) {
            editStatuses(event.target, (held) => spendShields(held, event.absorbed));
          }
          break;
        case 'heal':
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
    if (mp !== undefined) {
      this.liveMp.set(mp);
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
      this.settle(result);
    }
  }

  /**
   * Banks a fully narrated battle and returns to idle.
   *
   * This is the only place the run is written, and it happens in the same pass that plays the
   * closing event — so the outcome the player reads and the gold, income and stage they are
   * credited with land together, never one before the other.
   */
  private settle(result: BattleResult): void {
    this.isFighting.set(false);
    this.stop();
    this.playbackMs = 0;
    this.game.apply((state) => applyBattleResult(state, result, STAGES.length));
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
