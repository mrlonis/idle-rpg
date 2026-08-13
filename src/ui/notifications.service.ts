import { DestroyRef, inject, InjectionToken, Service } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SettingsService } from './settings.service';

/**
 * Come-back reminders: two local notifications, at twelve and twenty-four hours away.
 *
 * ## ⚠️ This reverses a decision the project had already made, deliberately
 *
 * `docs/history.md` argued for shipping **no** notifications, and the argument was sound on its
 * own terms: removing the offline cap removed the only *earned* reason to send one, because with
 * no cap staying away costs the player nothing, so every notification is manufacturing a session
 * rather than reporting a loss.
 *
 * That reasoning is preserved rather than deleted, and what changed is the product call above it —
 * see the milestone entry. What follows from keeping the old argument in view is the **shape** of
 * what is built here, and every constraint below exists because of it:
 *
 * - **Two, ever.** Not a daily drumbeat, not one per finished bounty, not an escalating series.
 * - **Nothing is lost by ignoring them**, and the copy says so rather than inventing urgency.
 *   There is no expiring reward, no streak and no penalty to describe, so the text does not
 *   pretend otherwise.
 * - **A setting the player can find**, defaulting on but one tap from off.
 * - **Cancelled on foreground.** A player who came back must not be told to come back.
 *
 * ## Why on-device notifications are compatible with "no server, no network"
 *
 * `@capacitor/local-notifications` schedules against the OS on the device. There is no push
 * token, no account, no remote and no request — the app hands the system a time and a string
 * before it is suspended. That is the only kind of notification this project could ever have, and
 * it is why the dependency was installed milestones ago and left unused rather than rejected.
 *
 * ## Scheduling is fire-and-forget, and every call is guarded
 *
 * On the web there is no notification permission worth prompting for and the plugin's web
 * implementation is a stub, so **every call is wrapped and every failure is swallowed**. A
 * reminder that fails to schedule costs nothing; an unhandled rejection from a `visibilitychange`
 * handler would surface as a crash in a path the player never chose to enter.
 */

/** How long after backgrounding each reminder fires. */
export const REMINDER_DELAYS_MS = [12 * 3_600_000, 24 * 3_600_000] as const;

/**
 * Fixed ids, so re-scheduling replaces rather than accumulates.
 *
 * ⚠️ **Not generated.** A player who backgrounds and foregrounds the app ten times in a minute
 * would otherwise queue twenty notifications, and cancelling would mean tracking every id ever
 * issued. Two constants make scheduling idempotent and cancellation total.
 */
const REMINDER_IDS = [1401, 1402] as const;

/** What each one says. */
const REMINDER_TEXT = [
  {
    title: 'Your idle income is piling up',
    body: 'Nothing is lost by staying away — but there is plenty waiting whenever you want it.',
  },
  {
    title: 'A day of earnings is banked',
    body: 'Your longest bounties have come home. No rush: it will all still be there.',
  },
] as const;

/** The plugin surface this service needs, so a test can supply one without a device. */
export interface NotificationScheduler {
  schedule(options: {
    notifications: {
      id: number;
      title: string;
      body: string;
      schedule: { at: Date };
    }[];
  }): Promise<unknown>;
  cancel(options: { notifications: { id: number }[] }): Promise<unknown>;
  requestPermissions(): Promise<{ display: string }>;
}

/**
 * The scheduler, injected rather than imported directly.
 *
 * ⚠️ **The seam exists because `vi.mock` is banned in this repo.** Specs share one module registry
 * in one thread, so a module mock only wins if that spec happens to import first — which is a
 * green suite locally and a red one in CI. `KEY_VALUE_STORE` in `save.service.ts` is the worked
 * example and this follows it exactly: the default factory returns the real plugin, and a test
 * overrides the provider.
 *
 * ⚠️ **The factory forwards to the plugin rather than handing back the plugin object.** A Capacitor
 * plugin is a `Proxy` that answers *every* property with a callable, so Angular's injector sees an
 * `ngOnDestroy` on it and calls it when the injector is torn down — which bridges to a native
 * method that does not exist and rejects. `KEY_VALUE_STORE` in `save.service.ts` carries the full
 * argument; the shape to copy is this one, a plain object exposing exactly the interface above.
 */
export const NOTIFICATION_SCHEDULER = new InjectionToken<NotificationScheduler>(
  'NOTIFICATION_SCHEDULER',
  {
    providedIn: 'root',
    factory: (): NotificationScheduler => ({
      schedule: (options) => LocalNotifications.schedule(options),
      cancel: (options) => LocalNotifications.cancel(options),
      requestPermissions: () => LocalNotifications.requestPermissions(),
    }),
  },
);

@Service()
export class NotificationsService {
  private readonly scheduler = inject(NOTIFICATION_SCHEDULER);
  private readonly settings = inject(SettingsService);

  /** Whether the OS has been asked yet. Asked once, lazily, and never on the critical path. */
  private askedForPermission = false;

  private readonly onVisibility = (): void => {
    if (document.visibilityState === 'hidden') {
      void this.schedule();
    } else {
      void this.cancel();
    }
  };

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibility);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('visibilitychange', this.onVisibility);
    });
  }

  /**
   * Schedules both reminders, replacing any already pending.
   *
   * ⚠️ **Reads the setting on every call rather than caching it**, so turning reminders off takes
   * effect at the next backgrounding rather than at the next launch. When they are off this also
   * *cancels* anything already queued — a player who switches the setting off having already
   * backgrounded the app once would otherwise still get the two they had accrued.
   */
  async schedule(): Promise<void> {
    if (!this.settings.reminders()) {
      await this.cancel();
      return;
    }
    await this.ensurePermission();

    const now = Date.now();
    try {
      await this.scheduler.schedule({
        notifications: REMINDER_IDS.map((id, index) => ({
          id,
          title: REMINDER_TEXT[index].title,
          body: REMINDER_TEXT[index].body,
          schedule: { at: new Date(now + REMINDER_DELAYS_MS[index]) },
        })),
      });
    } catch {
      // Swallowed on purpose. The web implementation is a stub, a device may have denied
      // permission, and neither is worth surfacing from a `visibilitychange` handler the player
      // never chose to trigger. A reminder that does not schedule costs nothing.
    }
  }

  /**
   * Cancels both reminders.
   *
   * Called whenever the app comes back to the foreground: **a player who has returned must not be
   * told to return.** That is the single most important line in this file — a notification arriving
   * while somebody is mid-session is the pattern that makes people turn notifications off for good.
   */
  async cancel(): Promise<void> {
    try {
      await this.scheduler.cancel({
        notifications: REMINDER_IDS.map((id) => ({ id })),
      });
    } catch {
      // Same reasoning as above.
    }
  }

  /**
   * Asks the OS for permission, once.
   *
   * Deliberately **not** on first launch. A permission prompt in the first ten seconds, before the
   * player knows what the app is, is the one most reliably denied — and a denial is permanent on
   * both platforms. Asking at the first backgrounding means it arrives after a session rather than
   * instead of one.
   */
  private async ensurePermission(): Promise<void> {
    if (this.askedForPermission) {
      return;
    }
    this.askedForPermission = true;
    try {
      await this.scheduler.requestPermissions();
    } catch {
      // A platform with no notification permission model at all, which is the web.
    }
  }
}
