import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  type CurrencyId,
  emptyWallet,
  type GameState,
  grantStarters,
  type Numeric,
  type OfflineReport,
  type PartyFormation,
  reconcileClearedStages,
  repairLoadouts,
  type RepairIssue,
  resume,
  stampSaveTime,
  tick,
  zeroRates,
} from '../core';
import { STARTER_FORMATION } from '../data';
import {
  CHAPTER_RULES,
  CHARACTERS_BY_ID,
  GEAR,
  LADDER,
  STAGE_REWARD_CURVE,
  SUMMON_RATE_CURVE,
} from './content';
import { SaveService } from './save.service';

/**
 * Stable empties for the pre-load window, so `wallet()` and `rates()` never hand a template a
 * null. Built once: a fresh object per read would make every `computed` downstream of them
 * recompute on every sample, which at ~6Hz is the whole UI.
 */
const EMPTY_WALLET = emptyWallet();
const ZERO_RATES = zeroRates();

/** Simulation step. The sim advances in fixed 10Hz slices regardless of frame rate. */
const SIM_STEP_MS = 100;

/** How often the simulation is sampled into a signal for rendering. ~6Hz is plenty. */
const UI_STEP_MS = 160;

/**
 * Ceiling on catch-up steps per frame. A frame that arrives late (a slow render, a brief
 * stall) catches up smoothly; a genuinely long gap is the offline path's job, not this
 * loop's.
 */
const MAX_STEPS_PER_FRAME = 5;

/** Backstop autosave. The real save trigger is `visibilitychange`. */
const AUTOSAVE_MS = 30_000;

/**
 * Shortest absence that earns a "while you were away" summary. Below this the player was
 * not meaningfully away, and showing a panel for it is noise.
 */
const OFFLINE_REPORT_MIN_MS = 60_000;

@Service()
export class GameLoopService {
  private readonly saves = inject(SaveService);

  private state: GameState | null = null;
  private simAccMs = 0;
  private uiAccMs = 0;
  private lastFrameAt = 0;
  private rafId = 0;
  private autosaveId: ReturnType<typeof setInterval> | undefined;
  private running = false;

  /**
   * The UI's read-only view of the simulation, resampled at ~6Hz.
   *
   * Core returns a new state object from every call and never mutates, so this holds the
   * returned reference directly. It must **not** be `structuredClone`d: that strips the
   * `Decimal` prototype from every quantity, leaving inert `{ mantissa, exponent }` objects
   * whose `.add()` throws on the next tick.
   */
  readonly snapshot = signal<GameState | null>(null);

  readonly isReady = computed(() => this.snapshot() !== null);

  /** Every currency the run holds, and what each earns per second. */
  readonly wallet = computed(() => this.snapshot()?.wallet ?? EMPTY_WALLET);
  readonly rates = computed(() => this.snapshot()?.rates ?? ZERO_RATES);

  /** One currency's balance, for a template that only cares about one. */
  balanceOf(id: CurrencyId): Numeric {
    return this.wallet()[id];
  }

  readonly gold = computed(() => this.wallet().gold);
  readonly goldPerSec = computed(() => this.rates().gold);
  readonly summons = computed(() => this.wallet().summons);
  readonly spark = computed(() => this.wallet().spark);

  /** The roster, the party fighting from it, and the pity counter. */
  readonly roster = computed(() => this.snapshot()?.roster ?? []);
  readonly formation = computed<PartyFormation>(
    () => this.snapshot()?.formation ?? { front: [], back: [] },
  );
  readonly pity = computed(() => this.snapshot()?.pity ?? 0);

  /** Offline earnings from the most recent resume, for a "while you were away" panel. */
  readonly offlineReport = signal<OfflineReport | null>(null);

  /**
   * Closes the "while you were away" panel.
   *
   * Lives here rather than as a flag on the screen because `HomeView` is lazily routed and
   * re-created on every navigation — a dismissal held in the component would bring the panel
   * back the moment the player looked at their roster and came home again.
   *
   * Discarding the report costs nothing: it is a receipt for income already banked in the
   * wallet, not the income itself. The next genuine absence publishes a fresh one.
   */
  dismissOfflineReport(): void {
    this.offlineReport.set(null);
  }

  /** Fields recovered from a damaged save, so the UI can tell the player what happened. */
  readonly saveIssues = signal<readonly RepairIssue[]>([]);

  /**
   * Set when the save could not be read at all and this run started fresh.
   *
   * **Informational, not a gate.** The loop used to refuse to persist while this was set, on the
   * grounds that the on-disk bytes might be a newer build's save. That protection went with the
   * v0 reset: a run that plays normally and silently never writes anything down is a worse
   * failure than a downgrade losing a save, and it is the one a player would actually hit.
   */
  readonly loadFailure = signal<string | undefined>(undefined);

  /**
   * The authoritative simulation state, ahead of the ~6Hz {@link snapshot} the UI renders
   * from. Read this when you need the exact current run rather than the sampled view.
   */
  get current(): GameState | null {
    return this.state;
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /** Loads the run, settles offline progress, then starts the loop. */
  async start(nowMs: number): Promise<void> {
    if (this.running) {
      return;
    }

    const loaded = await this.saves.load(nowMs);
    this.saveIssues.set(loaded.issues);
    this.loadFailure.set(loaded.fatal);

    // Two idempotent repairs, both needing content that `core/` cannot see, and both running on
    // every load rather than behind a version gate.
    //
    // `grantStarters` covers a save that arrives with an empty roster — a v2 save that predates
    // characters, or one damaged badly enough that every entry was dropped — so the player lands
    // with a party rather than a game they cannot play.
    //
    // `reconcileClearedStages` rebuilds the idle income a run has already earned. The v2 → v3
    // migration moved gold across and started the other three rates at zero, which stranded
    // returning players on gold-only income with no way back except re-fighting the ladder. It
    // also undercounted `clearedStages` at the top of the ladder, and paid none of the
    // first-clear crystal bonuses for a ladder that had demonstrably been climbed. All of it is
    // recoverable from the gold rate the save did keep.
    //
    // It is also where the crystal rate is established, for every run rather than only a damaged
    // one: that rate is a function of `clearedStages` rather than a per-stage unlock, and
    // `newGame` cannot evaluate it because the curve is content. A brand-new save therefore
    // arrives here earning nothing and leaves earning the base.
    //
    // `repairLoadouts` is the third of these and runs for the same reason: a loadout is a set of
    // ids into the bag, and the checks that matter — does the id resolve, is the piece in the slot
    // it claims, does its archetype still match its wearer — need both the bag and the content
    // this build ships. The save layer can see neither, so it parses the shape and leaves the
    // content check here. It only ever removes what cannot be rendered, so a healthy save comes
    // back as the same object.
    const repaired = grantStarters(loaded.state, STARTER_FORMATION, CHARACTERS_BY_ID);
    const reconciled = reconcileClearedStages(
      repaired,
      LADDER,
      CHAPTER_RULES,
      STAGE_REWARD_CURVE,
      SUMMON_RATE_CURVE,
    );
    this.state = repairLoadouts(reconciled, CHARACTERS_BY_ID, GEAR);
    this.settle(nowMs);

    this.running = true;
    this.lastFrameAt = performance.now();
    this.rafId = requestAnimationFrame(this.frame);

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.autosaveId = setInterval(() => void this.persist(), AUTOSAVE_MS);
  }

  stop(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    cancelAnimationFrame(this.rafId);
    clearInterval(this.autosaveId);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  /**
   * Settles unaccounted elapsed time in closed form and publishes the result.
   *
   * Used both on load and on returning to the foreground. The away window is never replayed
   * tick by tick — ten hours at 10Hz would be 360,000 iterations on resume and would hang
   * the device — so this pays `rate * elapsed`, clamped to the offline cap.
   *
   * Only time since `lastTickAt` is paid, and {@link advance} keeps that marker current, so
   * seconds already simulated in the foreground are never paid a second time.
   */
  settle(nowMs: number): void {
    if (this.state === null) {
      return;
    }
    const { state, report } = resume(this.state, nowMs);
    this.state = state;
    this.snapshot.set(state);
    this.simAccMs = 0;

    // Only a genuine absence gets a "while you were away" summary. Settles also happen for
    // trivial reasons — a tab regaining focus a second after load — and publishing those
    // would overwrite the real offline report with a near-zero one before the player has
    // read it.
    if (report.elapsedMs >= OFFLINE_REPORT_MIN_MS) {
      this.offlineReport.set(report);
    }
  }

  /**
   * Applies a pure `core/` transform to the authoritative run.
   *
   * This service owns the single mutable reference to the state, so anything that changes it —
   * a resolved battle now, a gacha pull later — hands in a function rather than keeping a copy
   * of its own. Two owners of the same state is how a run silently loses a battle's rewards to
   * the next autosave.
   *
   * The snapshot is republished immediately instead of waiting for the next ~6Hz sample:
   * discrete events are what the player is actually watching for, unlike a counter ticking.
   */
  apply(update: (state: GameState) => GameState): void {
    if (this.state === null) {
      return;
    }
    this.state = update(this.state);
    this.snapshot.set(this.state);
  }

  /**
   * Persists the run.
   *
   * `lastTickAt` is already current — {@link advance} and {@link settle} maintain it — so
   * the state is written as-is rather than restamped here.
   *
   * **A failed load no longer stops this**, which is the whole of what {@link loadFailure}
   * changed: a run that started fresh because the save was unreadable saves over it like any
   * other. The old behaviour left the game playable and permanently unable to write.
   */
  async persist(): Promise<void> {
    if (this.state === null) {
      return;
    }
    await this.saves.save(this.state);
  }

  /**
   * Advances the simulation by a wall-clock delta, in fixed 10Hz slices.
   *
   * Separate from the frame callback so the loop can be driven deterministically in tests;
   * `frame` is a thin wrapper that supplies the delta and reschedules itself.
   *
   * @param deltaMs elapsed real time since the previous advance
   * @param nowMs current wall-clock time, supplied by the caller
   */
  advance(deltaMs: number, nowMs: number): void {
    if (this.state === null || !Number.isFinite(deltaMs) || deltaMs <= 0) {
      return;
    }

    this.simAccMs += deltaMs;
    let steps = 0;
    while (this.simAccMs >= SIM_STEP_MS && steps < MAX_STEPS_PER_FRAME) {
      this.state = tick(this.state, SIM_STEP_MS);
      this.simAccMs -= SIM_STEP_MS;
      steps++;
    }
    if (steps === MAX_STEPS_PER_FRAME) {
      // Drop the backlog rather than spiralling. Anything this large is an offline window.
      this.simAccMs = 0;
    }

    if (steps > 0) {
      // Mark the run as simulated up to the moment actually covered — now, minus whatever
      // sub-step remainder is still sitting in the accumulator.
      //
      // This is load-bearing. `tick()` deliberately does not touch `lastTickAt`, because
      // core has no clock. If the foreground loop does not advance it either, `lastTickAt`
      // stays frozen at load time and the next `resume()` pays out the entire session a
      // second time, on top of everything already ticked.
      this.state = stampSaveTime(this.state, nowMs - this.simAccMs);
    }
  }

  private readonly frame = (rafNow: number): void => {
    if (!this.running || this.state === null) {
      return;
    }
    const delta = rafNow - this.lastFrameAt;
    this.lastFrameAt = rafNow;

    this.advance(delta, Date.now());

    this.uiAccMs += delta;
    if (this.uiAccMs >= UI_STEP_MS) {
      this.uiAccMs = 0;
      // In a zoneless app, setting a signal is what schedules change detection. Components
      // read `computed()` values off this snapshot, so only the bindings that actually
      // depend on a changed field re-render.
      this.snapshot.set(this.state);
    }

    this.rafId = requestAnimationFrame(this.frame);
  };

  /**
   * Saves on hide and settles the gap on show.
   *
   * `visibilitychange` rather than `beforeunload`, which is unreliable in a WebView — iOS
   * can suspend the app without warning and `beforeunload` may never fire.
   *
   * `requestAnimationFrame` stops while the page is hidden, so returning would otherwise
   * deliver one enormous frame delta. Settling through `resume()` and restamping
   * `lastFrameAt` keeps the two paths from double-counting the same seconds.
   */
  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      void this.persist();
      return;
    }
    this.settle(Date.now());
    // rAF was paused while hidden; without restamping, the next frame would report the whole
    // away period as a single delta.
    this.lastFrameAt = performance.now();
  };
}
