import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  type ActiveStatus,
  type ActivityKind,
  applyBattleResult,
  applyTowerResult,
  BATTLE_TICK_MS,
  battleSeed,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  CAMPAIGN_FORMATION,
  clampPosition,
  chaptersCleared,
  type GameState,
  isTowerUnlocked,
  type LadderPosition,
  MAX_ENERGY,
  nextFloor,
  type Numeric,
  type Row,
  type Side,
  simulateBattle,
  type StageData,
  stageIndex,
  ZERO,
} from '../core';
import { AUTO_BATTLE_UNLOCK_CHAPTERS } from '../data';
import {
  ACTIVITIES_BY_ID,
  CHAPTERS_IN_ORDER,
  COMBAT,
  EMBLEM_DROP_RULES,
  GEAR,
  GEAR_ALIGNMENTS,
  IDLE_RATE_CURVES,
  LADDER,
  STAGES,
  TOWER_FLOOR_BY_STAGE,
  TOWER_FLOORS,
  TOWER_SHAPE,
  TOWERS_BY_ID,
  type TowerFloor,
} from './content';
import { FormationService } from './formation.service';
import { GameLoopService } from './game-loop.service';
import { type PlaybackSpeed, SettingsService } from './settings.service';

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

/**
 * A fight named for display: which activity it belongs to, where in it, and how hard.
 *
 * ## Milestone 15b generalised this, and the generalisation is the whole of it
 *
 * It used to be a chapter, a stage number and a chapter name — a shape only the campaign has. A tower
 * floor is one number in one tower, and the two do not reduce to each other, so what is carried now
 * is the **rendered** position rather than its parts: `2-14` and `F37` both go on the same big line,
 * and neither screen has to know which kind of content it is drawing.
 *
 * Four strings for one heading looks like a lot and each has exactly one job — a big line, a
 * headline, a subtitle, and a button. Assembling any of them per screen is how the battle screen and
 * Home start naming the same fight two different ways.
 */
export interface StageHeading {
  /**
   * The activity this fight belongs to, which is also the crew's `FormationBook` key.
   *
   * Carried so a heading is self-describing: `autoStoppedAt` outlives the session field that produced
   * it, and a notice on Home that had to ask the service what it was about would be describing
   * whatever the player did next.
   */
  readonly activity: string;
  readonly kind: ActivityKind;
  /** The short position, for the big line: `2-14` on the ladder, `F37` in a tower. */
  readonly where: string;
  /** The headline: a campaign stage's own name, or a floor's — `Floor 40 — The Ninth Oath`. */
  readonly name: string;
  /** The subtitle that locates it: `Chapter 2 · The Ashfall Reach`, or `Human Tower · Floor 40 of 100`. */
  readonly place: string;
  /**
   * One line naming this fight for a control: `2-14 — Thornwood Clearing`, or `Floor 40`.
   *
   * A field rather than something a component assembles, because the two kinds want opposite halves
   * — a campaign stage needs its position spelled out beside its name, and a floor's name already
   * *is* its position, so the same template would read "F40 — Floor 40".
   */
  readonly label: string;
  /**
   * The level its enemies fight at.
   *
   * Worth a place in the heading since milestone 10, because it is now the whole of what makes
   * one stage harder than another — every archetype is authored at level 1 and fielded at this.
   * A player looking at "Lv 59" against a party in the forties can read the wall they are about
   * to hit, which no arrangement of enemy names ever told them.
   */
  readonly level: number;
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
  private readonly formations = inject(FormationService);
  private readonly settings = inject(SettingsService);

  /**
   * Which activity the current session is fighting.
   *
   * Session state, not saved: it describes a battle in flight, and a battle does not survive a
   * reload. Two things read it — the repeat loop, so auto-battle re-enters the **same** activity,
   * and the battle screen's Go Again control, so it returns to the right crew editor. Both would
   * silently fall back to the campaign without it, which is a bug that only appears once there is a
   * second thing to fight.
   */
  readonly activity = signal(CAMPAIGN_FORMATION);

  /**
   * Playback rate. Applies mid-battle: the animator integrates elapsed time, so changing this
   * speeds up the remainder of the current fight rather than restarting it.
   *
   * **This is the setting itself, not a copy of it.** The speed the player picks here and the one
   * they pick on the settings screen are one value read from two places, which is what makes the
   * battle controls sticky without anything having to keep two signals in step.
   */
  readonly playbackSpeed = this.settings.combatSpeed;

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
   * A count of finished **chapters** since the re-cut, resolved through `chaptersCleared` so the
   * unlock tracks the shipped chapter boundaries however they are cut. Read off `clearedStages`
   * rather than `stage`, because `stage` stops climbing at the top of the ladder and would answer
   * "no" forever for a run that had beaten everything.
   */
  readonly isAutoUnlocked = computed(
    () =>
      chaptersCleared(LADDER, this.game.snapshot()?.clearedStages ?? 0).total >=
      AUTO_BATTLE_UNLOCK_CHAPTERS,
  );

  /**
   * The stage an auto-battle run stopped on, or `null`.
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
   * The campaign stage the next campaign {@link fight} will enter, or `null` before the run has
   * loaded.
   *
   * Read off the run rather than off the last battle, so after a win it names the stage ahead
   * and after a loss it names the one to try again. Distinct from {@link stage}, which stays
   * pointed at the fight currently on screen.
   *
   * ⚠️ **Explicitly the campaign's, not {@link activity}'s.** Home's campaign card reads this, and
   * `activity` is a session field that may still be pointing at a tower the player fought ten minutes
   * ago — which would have the campaign card naming a tower floor.
   */
  readonly nextStage = computed<StageHeading | null>(() => {
    const snapshot = this.game.snapshot();
    return snapshot === null ? null : campaignHeading(snapshot);
  });

  /**
   * The fight the Go Again control on the battle screen names, or `null` when there is none.
   *
   * Follows {@link activity} rather than the campaign, which is the point: a tower session's control
   * has to name the next floor. `null` at the top of a tower, where there is nothing left to fight —
   * see {@link nextFight}.
   */
  readonly nextInSession = computed<StageHeading | null>(() => this.nextFight(this.activity()));

  /**
   * The fight `activityId` would enter next, or `null` when it has none to offer.
   *
   * Three ways to have none, and every one of them is a screen's business rather than an error: an
   * activity this build does not ship, a tower the campaign has not opened yet, and a tower already
   * topped. A caller drawing a control has to be able to tell those apart from "the run has not
   * loaded" — `TowerService.view` is what says which — but every one of them means the same thing
   * here, which is that {@link fight} will refuse.
   *
   * Reads the sampled snapshot, because every caller is a screen. {@link fight} resolves its own
   * target from the authoritative run.
   */
  nextFight(activityId: string): StageHeading | null {
    const snapshot = this.game.snapshot();
    return snapshot === null ? null : (this.targetFor(snapshot, activityId)?.heading ?? null);
  }

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
  fight(nowMs: number, activity: string = CAMPAIGN_FORMATION): void {
    const state = this.game.current;
    if (state === null || this.isFighting()) {
      return;
    }
    // Resolved from the **authoritative** run rather than the sampled snapshot: this is the call that
    // decides which floor a tower is paid for, and a stale read is a run paying for the same floor
    // twice. `null` means there is nothing to fight — an unknown activity, a tower the campaign has
    // not opened, or a tower already topped — and auto is switched off rather than left spinning on a
    // call that does nothing.
    const target = this.targetFor(state, activity);
    if (target === null) {
      this.isAuto.set(false);
      return;
    }
    // ⚠️ **The bounty invariant, enforced here and only here since milestone 15b.** Dispatch no
    // longer refuses a fielded character, so "nobody is in two places at once" has to bite on the
    // way out — and in the *service* rather than only on the pre-battle screen, because
    // auto-battle re-enters through `settle` without passing that screen again.
    //
    // ⚠️ **Only the away condition, deliberately — not `CrewView.ready`.** `ready` is also false
    // for an empty crew, and an empty party resolving as an immediate defeat is honest core
    // behaviour that `simulateBattle` owns and the specs rely on to make a loss deterministic.
    // Refusing it here would replace a fight the player loses with a button that does nothing.
    if ((this.formations.crew(activity)?.away.length ?? 0) > 0) {
      this.isAuto.set(false);
      return;
    }

    // Whatever stopped the last auto run is describing history the moment a new fight starts.
    this.autoStoppedAt.set(null);

    // Remembered for the whole session rather than read per fight, because auto-battle re-enters
    // through {@link settle} with no activity in hand — a repeat loop continues the thing it
    // started, and re-deriving that from the route would make it depend on where the player has
    // navigated since.
    this.activity.set(activity);

    const { heading, stage } = target;
    const result = simulateBattle(
      // The crew the player has chosen for this activity, with stats already scaled for level,
      // rung and gear — which is the whole reason the roster exists. An empty crew resolves as an
      // immediate defeat rather than being quietly substituted for the starters.
      this.formations.battleFormation(activity),
      stage,
      // A derived sub-stream: combat is reproducible and never advances `rng.calls`, so
      // replaying a battle cannot shift the pull sequence.
      battleSeed(state.rng.seed, stage.id, state.battleCount),
      COMBAT,
    );

    this.stage.set(heading);
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

  /**
   * Changes the playback rate, for this fight and for every fight after it.
   *
   * Sticky rather than per-battle: the speed a player wants is a property of the player, not of
   * the stage in front of them, and a 4× that had to be re-tapped every fight is a setting
   * pretending to be a control. It writes through to {@link SettingsService}, so the settings
   * screen shows the same value.
   */
  setSpeed(speed: PlaybackSpeed): void {
    this.settings.setCombatSpeed(speed);
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
      // The activity the session is already on, never the default. The toggle only exists on the
      // battle screen, so there is always one — and defaulting here would silently switch a tower
      // run onto the campaign at the moment the player armed the loop.
      this.fight(nowMs, this.activity());
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
    // Read back off the result rather than remembered from the start of the fight. `settle` runs
    // when the *animation* ends, which can be a minute of playback later, and a field set at the
    // top of `fight` is one more thing that has to still be true by then. The result names the
    // stage it was fought against, so the lookup cannot disagree with it — and a stage id that is a
    // tower floor is also what tells the two payout paths apart.
    const floor = TOWER_FLOOR_BY_STAGE.get(result.stageId);
    if (floor === undefined) {
      // The gear bundle is what turns a win into a drop. It is optional on `applyBattleResult` so
      // the balance sweep and the combat specs need not construct content they have no use for;
      // here it is always supplied, and the stage kind comes off the resolved stage rather than
      // being re-derived, because `LADDER` is chapter lengths and does not know where the
      // mini-bosses fall.
      const kind = STAGES.find((stage) => stage.id === result.stageId)?.kind ?? 'normal';
      this.game.apply((state) =>
        applyBattleResult(state, result, LADDER, IDLE_RATE_CURVES, {
          rules: GEAR,
          factions: GEAR_ALIGNMENTS,
          kind,
          emblems: EMBLEM_DROP_RULES,
        }),
      );
    } else {
      // ⚠️ **A separate function, not a branch inside `applyBattleResult`.** A tower clear may not
      // touch `clearedStages`, the ladder position or an idle rate, and `applyTowerResult` is where
      // that is true by construction rather than by a flag being honoured. `stageIndex` is the
      // **campaign** index this floor's level matched, so a floor drops the grades the campaign drops
      // where the fight is the same size — see `matchedStageIndex`.
      this.game.apply((state) =>
        applyTowerResult(state, floor.tower, TOWER_SHAPE, floor.floor, result, {
          rules: GEAR,
          factions: GEAR_ALIGNMENTS,
          stageIndex: floor.matchedStage,
          // The pre-fight count is the right one: a tower clear may never touch `clearedStages`,
          // so no floor can change how many chapters have been cleared.
          clearedChapters: chaptersCleared(LADDER, state.clearedStages).total,
          emblems: EMBLEM_DROP_RULES,
        }),
      );
    }
    void this.game.persist();

    if (!this.isAuto()) {
      return;
    }
    if (result.outcome === 'victory') {
      // Read before the next fight starts, because `fight` clears it. A win that leaves nothing to
      // fight — the top of a tower — is what this covers: the loop has to end, and it has to say
      // why, or the player is left on a settled board with a control that does nothing.
      const finished = this.stage();
      this.fight(nowMs, this.activity());
      if (!this.isFighting()) {
        this.isAuto.set(false);
        this.autoStoppedAt.set(finished);
      }
      return;
    }

    // Read before closing: `close` clears the board, and the stage that ended the run is the one
    // thing worth carrying off it.
    const stoppedAt = this.stage();
    this.isAuto.set(false);
    this.close();
    this.autoStoppedAt.set(stoppedAt);
  }

  /**
   * What `activityId` would fight next: the stage, and the heading that names it.
   *
   * The one place the two kinds of content diverge, and it is deliberately the *only* one — the
   * animator, the gear roll, the RNG label and every screen past this point take a `StageData` and a
   * {@link StageHeading} and never ask which kind they came from.
   *
   * `null` for an activity this build does not ship, for a tower the campaign has not opened, and for
   * a tower already topped. The campaign never returns `null`: its position stops climbing at the top
   * of the ladder so its last stage stays farmable, which is exactly the difference `nextFloor`
   * refuses to paper over for a tower.
   */
  private targetFor(
    state: GameState,
    activityId: string,
  ): { readonly stage: StageData; readonly heading: StageHeading } | null {
    const activity = ACTIVITIES_BY_ID.get(activityId);
    if (activity === undefined) {
      return null;
    }
    if (activity.kind !== 'tower') {
      return { stage: stageFor(state), heading: campaignHeading(state) };
    }
    const tower = TOWERS_BY_ID.get(activity.id);
    if (tower === undefined || !isTowerUnlocked(state, tower)) {
      return null;
    }
    const floor = nextFloor(state, tower);
    const resolved = floor === null ? undefined : TOWER_FLOORS.get(tower.id)?.[floor - 1];
    return resolved === undefined
      ? null
      : { stage: resolved.stage, heading: towerHeading(resolved) };
  }
}

/**
 * Resolves a run's position to the stage that will be fought.
 *
 * Clamped here rather than in `core/`, which cannot import `data/` and so has no way to know how
 * long the chapters are. A save from a build with more content than this one still lands
 * somewhere sensible instead of on `undefined`.
 */
function stageFor(position: LadderPosition): StageData {
  return STAGES[stageIndex(LADDER, position) - 1];
}

/** The same stage, named for a heading: where on the ladder, what it is called, and how hard. */
function campaignHeading(position: LadderPosition): StageHeading {
  const { chapter, stage } = clampPosition(LADDER, position);
  const content = stageFor(position);
  const where = `${chapter}-${stage}`;
  return {
    activity: CAMPAIGN_FORMATION,
    kind: 'campaign',
    where,
    name: content.name,
    place: `Chapter ${chapter} · ${CHAPTERS_IN_ORDER[chapter - 1].name}`,
    label: `${where} — ${content.name}`,
    level: content.level,
  };
}

/**
 * A tower floor, named for a heading.
 *
 * `F37` on the big line rather than `37`, so the number is never mistaken for a chapter's stage — the
 * two headings sit in the same slot on the same screen, and a bare integer beside a `2-14` reads as a
 * truncation.
 */
function towerHeading(floor: TowerFloor): StageHeading {
  return {
    activity: floor.tower.id,
    kind: 'tower',
    where: `F${floor.floor}`,
    name: floor.stage.name,
    place: `${floor.tower.name} · Floor ${floor.floor} of ${floor.tower.floors.length}`,
    // The floor's name already carries its number, so spelling the position out again would read
    // "F40 — Floor 40 — The Ninth Oath".
    label: floor.stage.name,
    level: floor.stage.level,
  };
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
