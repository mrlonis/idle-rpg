import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  applyBattleResult,
  BATTLE_TICK_MS,
  battleSeed,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  type GameState,
  type Numeric,
  type Side,
  simulateBattle,
  type StageData,
} from '../core';
import { STAGES, STARTER_TEAM } from '../data';
import { GameLoopService } from './game-loop.service';

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

/** Pause between the end of one battle and the start of the next, in battle time. */
const INTERMISSION_MS = 1500;

/** Log entries kept for display. The full log lives on the result; this is what fits on screen. */
const VISIBLE_LOG_LENGTH = 6;

/** Playback speeds offered to the player. */
export const PLAYBACK_SPEEDS = [1, 2, 4] as const;

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

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
  readonly hp: Numeric;
  readonly maxHp: Numeric;
  /** Remaining HP as a 0–1 fraction, for a progress bar. */
  readonly fraction: number;
  readonly isDown: boolean;
}

/**
 * Resolves battles and narrates them.
 *
 * The division of labour is the whole point of this milestone. `simulateBattle` resolves a
 * fight **instantly and in full** into an event log, and the run's state is updated then and
 * there. This service afterwards walks that log against the wall clock so the player has
 * something to watch.
 *
 * Combat is therefore not driven by the render tick, which is what makes playback speed nearly
 * free — 2x is one multiplication in {@link advance}, not a second combat implementation. It is
 * also why offline resolution and skipping will be cheap when they arrive.
 *
 * **State is applied at simulation time, not at the end of the animation.** The alternative —
 * holding rewards back until the log finishes playing — means an autosave, a backgrounded app,
 * or a reload mid-fight silently loses a battle the player already won. The visible cost is
 * that gold moves a moment before the animation shows why, which is a fair trade for a run that
 * is always consistent with what has been saved.
 */
@Service()
export class BattleService {
  private readonly game = inject(GameLoopService);

  /** Playback rate. Applies mid-battle: the animator integrates elapsed time, so changing this
   * speeds up the remainder of the current fight rather than restarting it. */
  readonly playbackSpeed = signal<PlaybackSpeed>(1);

  /** The battle being narrated, or `null` before the first one has been resolved. */
  readonly result = signal<BattleResult | null>(null);

  /** The stage the current battle is being fought on. Held separately from the run's `stage`,
   * which has already advanced by the time the animation plays. */
  readonly stage = signal<{ readonly name: string; readonly number: number } | null>(null);

  /** Events that have played so far, most recent last. Trimmed to what the view shows. */
  readonly recentEvents = signal<readonly BattleEvent[]>([]);

  /** Set when the closing event plays, so the outcome is not spoiled before the fight ends. */
  readonly outcome = signal<BattleOutcome | null>(null);

  private readonly liveHp = signal<ReadonlyMap<string, Numeric>>(new Map());

  /** Monotonic counter over battles narrated this session. Only identity matters, not the value. */
  private readonly battleId = signal(0);

  private phase: 'waiting' | 'playing' | 'intermission' = 'waiting';
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
    const battle = this.battleId();
    return result.roster.map((combatant) => {
      const current = hp.get(combatant.key) ?? combatant.maxHp;
      return {
        key: combatant.key,
        viewKey: `${battle}:${combatant.key}`,
        name: combatant.name,
        side: combatant.side,
        hp: current,
        maxHp: combatant.maxHp,
        fraction: fractionOf(current, combatant.maxHp),
        isDown: current.lte(0),
      };
    });
  });

  readonly party = computed(() => this.combatants().filter((c) => c.side === 'ally'));
  readonly foes = computed(() => this.combatants().filter((c) => c.side === 'enemy'));

  /** Maps a combatant key to its display name, for narrating the log. */
  readonly names = computed<ReadonlyMap<string, string>>(() => {
    const roster = this.result()?.roster ?? [];
    return new Map(roster.map((combatant) => [combatant.key, combatant.name]));
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /** Starts narrating battles. Safe to call before the run has loaded; it idles until it has. */
  start(): void {
    if (this.stepId !== undefined) {
      return;
    }
    this.lastAt = Date.now();
    // Deliberately not gated on `document.visibilityState`. A backgrounded tab throttles this
    // timer to about 1Hz, and the step clamp already keeps that from skipping a fight, so the
    // only effect of letting it run is that a tab left open keeps playing — which this game has
    // no reason to police. On the actual target the question does not arise: iOS suspends the
    // WebView outright, so no timer fires at all and the away window is the offline path's job.
    this.stepId = setInterval(() => this.advance(Date.now()), ANIMATION_STEP_MS);
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
    const state = this.game.current;
    if (state === null) {
      this.lastAt = nowMs;
      return;
    }

    const delta = nowMs - this.lastAt;
    this.lastAt = nowMs;
    if (!Number.isFinite(delta) || delta <= 0) {
      return;
    }
    this.playbackMs += Math.min(delta, MAX_STEP_MS) * this.playbackSpeed();

    switch (this.phase) {
      case 'waiting':
        this.begin(state);
        return;
      case 'playing':
        this.play();
        return;
      case 'intermission':
        if (this.playbackMs >= INTERMISSION_MS) {
          this.begin(state);
        }
        return;
    }
  }

  /** Resolves the next battle and applies it to the run, then queues it for narration. */
  private begin(state: GameState): void {
    const { stage, number } = stageFor(state.stage);
    const result = simulateBattle(
      STARTER_TEAM,
      stage,
      // A derived sub-stream: combat is reproducible and never advances `rng.calls`, so
      // replaying a battle cannot shift the pull sequence.
      battleSeed(state.rng.seed, stage.id, state.battleCount),
    );

    this.game.apply((current) => applyBattleResult(current, result, STAGES.length));

    this.stage.set({ name: stage.name, number });
    this.result.set(result);
    this.liveHp.set(new Map(result.roster.map((combatant) => [combatant.key, combatant.maxHp])));
    this.recentEvents.set([]);
    this.outcome.set(null);
    this.battleId.update((id) => id + 1);
    this.cursor = 0;
    this.playbackMs = 0;
    this.phase = 'playing';
  }

  /** Plays every event whose tick has now been reached. */
  private play(): void {
    const result = this.result();
    if (result === null) {
      this.phase = 'waiting';
      return;
    }

    const played: BattleEvent[] = [];
    let hp: Map<string, Numeric> | undefined;

    while (this.cursor < result.events.length) {
      const event = result.events[this.cursor];
      if (event.tick * BATTLE_TICK_MS > this.playbackMs) {
        break;
      }
      this.cursor++;
      played.push(event);
      if (event.kind === 'attack') {
        hp ??= new Map(this.liveHp());
        hp.set(event.target, event.targetHp);
      } else if (event.kind === 'end') {
        this.outcome.set(event.outcome);
      }
    }

    if (played.length > 0) {
      if (hp !== undefined) {
        this.liveHp.set(hp);
      }
      this.recentEvents.update((events) => [...events, ...played].slice(-VISIBLE_LOG_LENGTH));
    }

    if (this.cursor >= result.events.length) {
      this.phase = 'intermission';
      this.playbackMs = 0;
    }
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
