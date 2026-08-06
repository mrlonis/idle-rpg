import { inject, Service, signal } from '@angular/core';
import { KEY_VALUE_STORE } from './save.service';

/**
 * Where preferences are written.
 *
 * **A key of its own, deliberately not a field on the save.** A preference is a statement about
 * how the player wants the app to behave, and a save is a statement about a run — so putting
 * them in one blob would mean a run reset also resets how fast battles play, and a save this
 * build could not read would take the player's settings down with it. Neither is a thing anybody
 * asked for.
 *
 * It also keeps the save chain out of it. Every setting added here would otherwise be a
 * `SAVE_VERSION` bump and a migration, for a value nothing in `core/` ever reads.
 */
const SETTINGS_KEY = 'settings';

/**
 * Playback speeds offered to the player, in both places one is offered.
 *
 * These live here rather than on `BattleService` because the speed is now a **setting** that a
 * battle happens to read, rather than a battle control that happens to be remembered. The
 * settings screen and the battle screen render the same three options from this list.
 */
export const PLAYBACK_SPEEDS = [1, 2, 4] as const;

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** What a run plays at until the player says otherwise. */
const DEFAULT_COMBAT_SPEED: PlaybackSpeed = 1;

/**
 * Whether the app schedules its two come-back reminders.
 *
 * **On by default**, which is a deliberate choice rather than the easy one. The reminders are the
 * only thing in this app that reaches a player who is not using it, so defaulting them off would
 * be the safer-sounding option — and it would mean the feature effectively does not exist, since
 * nobody opens a settings screen to turn on a notification they have never seen. Defaulting on and
 * making the switch easy to find is the honest version of shipping it.
 *
 * ⚠️ It stays a **setting** rather than a constant precisely because of that: a player who does
 * not want to be interrupted has to have one place to say so, and it must not be buried.
 */
const DEFAULT_REMINDERS = true;

/** Coerces a stored value into a boolean, defaulting anything unrecognised. */
function toReminders(value: unknown): boolean {
  return typeof value === 'boolean' ? value : DEFAULT_REMINDERS;
}

/**
 * Coerces a stored value into a speed this build offers.
 *
 * Anything unrecognised — a damaged blob, a speed a later build removed — becomes the default
 * rather than an error. This is the whole of the repair strategy; see {@link SettingsService}.
 */
function toCombatSpeed(value: unknown): PlaybackSpeed {
  return PLAYBACK_SPEEDS.find((speed) => speed === value) ?? DEFAULT_COMBAT_SPEED;
}

/**
 * The player's preferences, persisted beside the save rather than inside it.
 *
 * ## There is no version field, and that is not an oversight
 *
 * The save carries a version because its fields are load-bearing and interdependent — a wallet
 * without its rates is a broken run, so it needs a migration chain that can restate the whole
 * object. Settings are the opposite shape: every field is independent, optional, and has a
 * default that is always correct. So the repair is **per field, on read** — an unknown value
 * becomes the default, a field this build does not know is ignored, and a field a stored blob
 * has never heard of simply defaults. That subsumes both directions of migration for free, and a
 * version number would only be a number nothing consults.
 *
 * The bar for revisiting this is a setting whose old and new meanings **collide** at the same key
 * — which is exactly the trap `SAVE_VERSION` 1 records for the save chain. Add a new key instead.
 */
@Service()
export class SettingsService {
  private readonly store = inject(KEY_VALUE_STORE);

  private readonly combatSpeedState = signal<PlaybackSpeed>(DEFAULT_COMBAT_SPEED);
  private readonly remindersState = signal<boolean>(DEFAULT_REMINDERS);

  /**
   * The speed battles play at.
   *
   * Read-only here: every write goes through {@link setCombatSpeed}, so a change cannot reach the
   * screen without also reaching the disk.
   */
  readonly combatSpeed = this.combatSpeedState.asReadonly();

  /** Whether the two come-back reminders are scheduled when the app goes to the background. */
  readonly reminders = this.remindersState.asReadonly();

  /**
   * Set once the player has chosen a speed this session, so a slow read cannot undo them.
   *
   * The load below is asynchronous — a bridge round-trip on a device — and the battle screen is
   * live the whole time. Without this, a player who taps 4× in the first moments of a session
   * would be silently put back to whatever was on disk when the read landed.
   */
  private chosen = false;

  /**
   * The tail of the write chain, so writes land in the order they were made.
   *
   * A settings write is a single `set` rather than the save's read-then-write across two slots,
   * so it cannot tear — but two overlapping writes could still *complete* out of order, which
   * would persist the earlier tap. Chaining makes last-write-wins mean the last tap.
   */
  private writing: Promise<void> = Promise.resolve();

  /** Resolves once the stored settings have been read. */
  readonly ready: Promise<void>;

  /**
   * Resolves once every write requested so far has been attempted.
   *
   * Attempted rather than landed: {@link persist} swallows a failure, so this never rejects and a
   * caller cannot tell a successful write from a store that refused one. That is the right shape
   * for the app — nothing here has a recovery to run — and a test that cares checks the store.
   */
  get written(): Promise<void> {
    return this.writing;
  }

  constructor() {
    this.ready = this.load();
  }

  /**
   * Reads the stored settings.
   *
   * Never throws and never rejects: a missing key, a truncated blob and a value from a build that
   * offered different speeds all resolve to the defaults already on the signals. Losing a
   * preference is a nuisance; failing to boot over one would not be.
   */
  private async load(): Promise<void> {
    const stored = await this.read();
    if (stored === null || this.chosen) {
      return;
    }
    this.combatSpeedState.set(toCombatSpeed(stored['combatSpeed']));
    this.remindersState.set(toReminders(stored['reminders']));
  }

  private async read(): Promise<Record<string, unknown> | null> {
    try {
      const { value } = await this.store.get({ key: SETTINGS_KEY });
      if (value === null) {
        return null;
      }
      const parsed: unknown = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }

  /**
   * Chooses the speed battles play at, and writes it.
   *
   * Called from the settings screen and from the battle screen's own controls, which are the same
   * setting seen from two places rather than two settings that have to be kept in step.
   */
  setCombatSpeed(speed: PlaybackSpeed): void {
    this.chosen = true;
    this.combatSpeedState.set(speed);
    void this.persist();
  }

  /** Turns the come-back reminders on or off, and writes the choice. */
  setReminders(enabled: boolean): void {
    this.chosen = true;
    this.remindersState.set(enabled);
    void this.persist();
  }

  /**
   * Writes the current settings.
   *
   * The value is serialised **before** joining the chain, so the write that lands last is the one
   * that was requested last.
   *
   * ⚠️ **The `catch` is at the tail, and that placement is the whole of it.** A failed write is
   * swallowed for two reasons: a rejection parked on the chain would silently skip every write
   * after it, and {@link setCombatSpeed} fires this and forgets it — so a chain that could reject
   * would surface as an unhandled rejection from a control the player merely tapped. Catching the
   * *predecessor* instead protects only the write before this one, which is the half of the
   * problem that is easy to write and the wrong half.
   *
   * Losing a preference to a failed write is a nuisance the next tap fixes. Taking the app's
   * error reporting with it is not.
   */
  private persist(): Promise<void> {
    const value = JSON.stringify({
      combatSpeed: this.combatSpeedState(),
      reminders: this.remindersState(),
    });
    this.writing = this.writing
      .then(() => this.store.set({ key: SETTINGS_KEY, value }))
      .catch(() => undefined);
    return this.writing;
  }
}
