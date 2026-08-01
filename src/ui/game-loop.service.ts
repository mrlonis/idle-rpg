import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  type CurrencyId,
  emptyWallet,
  type GameState,
  grantStarters,
  type Numeric,
  type OfflineReport,
  type RepairIssue,
  resume,
  stampSaveTime,
  tick,
  zeroRates,
} from '../core';
import { STARTER_CHARACTER_IDS } from '../data';
import { CHARACTERS_BY_ID } from './content';
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
  readonly activeParty = computed(() => this.snapshot()?.activeParty ?? []);
  readonly pity = computed(() => this.snapshot()?.pity ?? 0);

  /** Offline earnings from the most recent resume, for a "while you were away" panel. */
  readonly offlineReport = signal<OfflineReport | null>(null);

  /** Fields recovered from a damaged save, so the UI can tell the player what happened. */
  readonly saveIssues = signal<readonly RepairIssue[]>([]);

  /**
   * Set when the save could not be read at all. While this is set the loop refuses to
   * persist, because the on-disk bytes may be a newer build's save that is still perfectly
   * good — overwriting it would destroy a working run.
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

    // Seed the starting party. `core/` cannot see `data/`, so it has no way to know who the
    // starters are; this is idempotent, so it is also the repair path for a save that arrives
    // with an empty roster — a v2 save that predates characters, or one damaged badly enough
    // that every entry was dropped. Either way the player lands with a party rather than a
    // game they cannot play.
    this.state = grantStarters(loaded.state, STARTER_CHARACTER_IDS, CHARACTERS_BY_ID);
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
   * Persists the run, unless the save on disk could not be read.
   *
   * `lastTickAt` is already current — {@link advance} and {@link settle} maintain it — so
   * the state is written as-is rather than restamped here.
   */
  async persist(): Promise<void> {
    if (this.state === null || this.loadFailure() !== undefined) {
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
