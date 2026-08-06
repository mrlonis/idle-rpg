import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import {
  NOTIFICATION_SCHEDULER,
  type NotificationScheduler,
  NotificationsService,
  REMINDER_DELAYS_MS,
} from './notifications.service';
import { SettingsService } from './settings.service';

/**
 * A stand-in for the Capacitor plugin.
 *
 * ⚠️ Supplied through {@link NOTIFICATION_SCHEDULER} rather than by mocking the module. `vi.mock`
 * is banned in this repo — specs share one module registry in one thread, so a module mock only
 * wins if that spec happens to import first, which is a green suite locally and a red one in CI.
 * The token exists for exactly this.
 */
class FakeScheduler implements NotificationScheduler {
  readonly scheduled: { id: number; title: string; body: string; schedule: { at: Date } }[][] = [];
  readonly cancelled: { id: number }[][] = [];
  permissionRequests = 0;
  /** Set to make every call reject, standing in for a stub web implementation or a denial. */
  broken = false;

  schedule(options: {
    notifications: { id: number; title: string; body: string; schedule: { at: Date } }[];
  }): Promise<unknown> {
    if (this.broken) {
      return Promise.reject(new Error('no notification support'));
    }
    this.scheduled.push(options.notifications);
    return Promise.resolve();
  }

  cancel(options: { notifications: { id: number }[] }): Promise<unknown> {
    if (this.broken) {
      return Promise.reject(new Error('no notification support'));
    }
    this.cancelled.push(options.notifications);
    return Promise.resolve();
  }

  requestPermissions(): Promise<{ display: string }> {
    this.permissionRequests++;
    return Promise.resolve({ display: 'granted' });
  }
}

class FakeSettings {
  readonly remindersState = signal(true);
  readonly reminders = this.remindersState.asReadonly();
}

function setUp() {
  const scheduler = new FakeScheduler();
  const settings = new FakeSettings();

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: NOTIFICATION_SCHEDULER, useValue: scheduler },
      { provide: SettingsService, useValue: settings },
    ],
  });

  return { scheduler, settings, service: TestBed.inject(NotificationsService) };
}

describe('NotificationsService', () => {
  it('schedules exactly two reminders, at twelve and twenty-four hours', async () => {
    const { scheduler, service } = setUp();
    const before = Date.now();

    await service.schedule();

    expect(scheduler.scheduled).toHaveLength(1);
    const [batch] = scheduler.scheduled;
    expect(batch).toHaveLength(2);
    expect(batch[0].schedule.at.getTime() - before).toBeGreaterThanOrEqual(REMINDER_DELAYS_MS[0]);
    expect(batch[1].schedule.at.getTime() - before).toBeGreaterThanOrEqual(REMINDER_DELAYS_MS[1]);
  });

  it('reuses fixed ids, so re-scheduling replaces rather than accumulates', async () => {
    // ⚠️ Generated ids would queue twenty notifications for a player who backgrounded ten times in
    // a minute, and cancelling would mean tracking every id ever issued.
    const { scheduler, service } = setUp();

    await service.schedule();
    await service.schedule();

    expect(scheduler.scheduled[0].map((entry) => entry.id)).toEqual(
      scheduler.scheduled[1].map((entry) => entry.id),
    );
  });

  it('cancels the same ids it schedules', async () => {
    const { scheduler, service } = setUp();

    await service.schedule();
    await service.cancel();

    expect(scheduler.cancelled[0].map((entry) => entry.id)).toEqual(
      scheduler.scheduled[0].map((entry) => entry.id),
    );
  });

  it('promises nothing is lost, rather than inventing urgency', async () => {
    // ⚠️ Load-bearing copy. Nothing in this game expires, so a notification claiming otherwise
    // would be manufacturing a session — the pattern `docs/milestones.md` rejects by name. If a
    // future reminder needs urgency, the thing to question is the system that created it.
    const { scheduler, service } = setUp();

    await service.schedule();

    const text = scheduler.scheduled[0].map((entry) => `${entry.title} ${entry.body}`).join(' ');
    expect(text).toMatch(/nothing is lost|no rush|still be there/i);
    expect(text).not.toMatch(/expire|last chance|hurry|don't miss|running out/i);
  });

  it('schedules nothing when the player has turned reminders off', async () => {
    const { scheduler, settings, service } = setUp();
    settings.remindersState.set(false);

    await service.schedule();

    expect(scheduler.scheduled).toEqual([]);
  });

  it('cancels anything already queued when reminders are switched off', async () => {
    // A player who backgrounded once and then turned the setting off would otherwise still get the
    // two they had already accrued.
    const { scheduler, settings, service } = setUp();
    await service.schedule();
    settings.remindersState.set(false);

    await service.schedule();

    expect(scheduler.cancelled).toHaveLength(1);
  });

  it('reads the setting on every call rather than caching it', async () => {
    const { scheduler, settings, service } = setUp();
    settings.remindersState.set(false);
    await service.schedule();
    settings.remindersState.set(true);

    await service.schedule();

    expect(scheduler.scheduled).toHaveLength(1);
  });

  it('asks for permission once, and not before the first schedule', async () => {
    // ⚠️ Never on first launch. A prompt in the first ten seconds is the one most reliably denied,
    // and a denial is permanent on both platforms.
    const { scheduler, service } = setUp();
    expect(scheduler.permissionRequests).toBe(0);

    await service.schedule();
    await service.schedule();

    expect(scheduler.permissionRequests).toBe(1);
  });

  it('swallows a scheduler that refuses, rather than rejecting', async () => {
    // The web implementation is a stub and a device may have denied permission. Neither is worth
    // surfacing from a `visibilitychange` handler the player never chose to trigger.
    const { scheduler, service } = setUp();
    scheduler.broken = true;

    await expect(service.schedule()).resolves.toBeUndefined();
    await expect(service.cancel()).resolves.toBeUndefined();
  });

  it('schedules on hide and cancels on show, without anything calling it', async () => {
    // The listener is registered in the constructor, which is why `App` injects the service for
    // its side effect. A player who has come back must not be told to come back.
    const { scheduler } = setUp();
    const hidden = vi.spyOn(document, 'visibilityState', 'get');

    hidden.mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    await Promise.resolve();
    expect(scheduler.scheduled.length).toBeGreaterThan(0);

    hidden.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    expect(scheduler.cancelled.length).toBeGreaterThan(0);

    hidden.mockRestore();
  });
});
