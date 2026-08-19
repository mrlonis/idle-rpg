# Platform, shell and accessibility

What the app is wrapped in, and what running it on a real phone taught. `AGENTS.md` states these as
rules; this file is why each one is a rule.

Capacitor 8 over an Angular 22 web build, iOS-first with Android secondary. Floors are iOS 15+ and
API 24+, which is what `browserslist` has to stay aligned with — Angular's default target can emit
syntax old Android System WebView cannot parse, and that fails at parse time with a blank screen and
no visible error.

---

## The first run on real hardware

Milestone 6 put the app on a physical iPhone while it was still small, so the signing and
provisioning pain landed early rather than next to a deadline. It found one bug, and the bug is the
reason half of this file exists.

**The app worked and looked broken:** a narrow column of content down the middle, white margins on
all four sides, and a full-width dark tab bar that did not line up with anything above it. The
obvious reading is that the page is zoomed out — on iOS a `position: fixed` element lays out against
the _visual_ viewport, so it keeps filling the screen while a scaled-down document does not, and
that is exactly the signature.

It was not zoom. The cause was three lines of the Angular CLI's scaffolded `src/styles.scss`, never
edited since `ng new`:

```scss
body {
  color-scheme: light; // → --mat-sys-surface resolved to rgb(255, 248, 248)
  background-color: var(--mat-sys-surface);
  padding: env(safe-area-inset-top); // → 59px on ALL FOUR sides
}
```

⚠️ **`padding` with a single value applies it to every side**, so the _top_ inset became a 59px
gutter down both edges — a 275px content column in a 393px viewport. The fixed tab bar stayed 393px
because fixed elements do not care what the document is doing.

Two things worth keeping from it:

- **The tell that says "zoom" also says "the document is narrower than the viewport", and the second
  is far more likely.** Measure before theorising; `getComputedStyle` on `body` would have ended it
  in a minute. The bug was reproduced headlessly in Chromium at 393×852 with CDP's safe-area
  override and the scale pinned at 1.0, matching the phone pixel for pixel.
- **The trap generalises to any `env()` or `var()` in a shorthand**: the value names a side, the
  property does not know that. Use the longhand, or the fully spelled-out four-value form.

---

## The shell

- **The document must not scroll; a container inside it does.** `html` and `body` are
  `height: 100%; overflow: hidden`, the shell is a flex column, and `main` is the scroll container.
  This is structural rather than cosmetic: it removes page-level rubber-banding, and it lets the tab
  bar be a flex item instead of `position: fixed`. **A bar that is a sibling in the layout cannot
  disagree with the content above it**, which is what stops any layout bug elsewhere presenting as a
  broken tab bar.
- **Safe-area insets go where they cannot scroll away, and the split matters.** Horizontal and top
  insets on the shell so content cannot slide under the notch; bottom inset on the tab bar so its
  own surface fills the home-indicator strip. Moving the bottom inset up alongside the other three
  looks tidier and puts the tab bar's touch targets over the home indicator.
- **`backgroundColor` is set in `capacitor.config.ts`**, globally and per platform. Unset,
  `CAPBridgeViewController` falls back to `UIColor.systemBackground` — white in light mode — and
  that is what shows before first paint and anywhere web content does not reach.
- **No webfonts.** The app is offline-only, so a `fonts.googleapis.com` stylesheet is a network call
  on the critical rendering path that fails exactly when the player has no signal. Milestone 6
  deleted the scaffolded Roboto and Material Icons links; neither was used. `src/styles.scss` uses
  the platform system stack.
- **Angular Material is removed, not deferred.** Nothing imported it; the only thing it did was own
  `styles.scss`, and what it did there was the bug above. `styles.css` went from 8.82 kB to 699
  bytes. If a control ever genuinely needs it, reinstalling is one command — but write the global
  styles by hand rather than accepting `mat.theme()`, which assumes a light scheme and a webfont
  this project cannot have.
- **`ios/` and `android/` are committed source, not build artifacts.** Build order is `ng build` →
  `cap sync` → open; syncing before building ships stale assets. Never ship with `server.url` set —
  that is dev-only and triggers App Store rejection under Guideline 4.2.

### The native change that turned out not to be needed

Standard advice for this class of problem ends with "subclass `CAPBridgeViewController` and disable
the pinch recogniser and `scrollView.bounces` yourself". **Capacitor 8 already does both** —
`zoomEnabled` defaults to false and `scrollView.bounces = false` is already set.
`capacitor.config.ts` states `zoomEnabled: false` and `contentInset: 'never'` anyway, because a
silent default is not a decision anyone can find later, but no Swift was written and `ios/` was not
touched.

⚠️ **Read the pod source in `node_modules/@capacitor/ios/` before accepting that a WebView problem
needs a native fix.** The same discipline caught stale advice about CDK's stylesheets below.

---

## Accessibility

The bar is **all AXE checks pass and WCAG AA minimums hold**. It is load-bearing rather than
aspirational, and it has caught two real bugs within a minute of each being written.

### `user-scalable=no` is the reflex fix and it is all cost

Disabling zoom via the viewport meta was written, and the accessibility suite immediately failed all
six screens on AXE's `meta-viewport` rule (WCAG 1.4.4). It bought nothing: `zoomEnabled: false`
disables the pinch recogniser natively on both platforms, and `touch-action: manipulation` handles
double-tap. Keep `viewport-fit=cover` — that is what makes the safe-area insets report real values
instead of zero.

⚠️ **`touch-action: manipulation` does not veto WKWebView's double-tap zoom, and the shell now
disables that recogniser natively.** The CSS was tried at both scopes and failed on device both
times: on `html` alone from milestone 6, then on every element via `*` — the second failure with
`*{touch-action:manipulation}` verifiably in the synced bundle, so it was not inheritance (the
property does not inherit) and not a stale build. Safari honours the veto; WKWebView's own
double-tap recogniser fires without consulting it. The zoom it performs is a trap, because
Capacitor implements `zoomEnabled: false` as `scrollViewWillBeginZooming` disabling the _pinch_
recogniser (`WebViewDelegationHandler.swift`) — the way back out of a zoom, not the double-tap way
in — so the player is stranded at the zoomed scale.

The fix is `ios/App/App/BridgeViewController.swift`, the project's first and only
`CAPBridgeViewController` subclass: it walks the scroll view's subviews and disables every
one-finger double-tap recogniser, public API only. ⚠️ **It runs from `viewDidAppear`, and that is
load-bearing**: `WKContentView` installs its recognisers when it joins a window, so a
`viewDidLoad` or `capacitorDidLoad` hook walks an empty list and silently fixes nothing. The
subclass passed the pod-source test above rather than violating it — the source was read, twice,
and it covers pinch and never double-tap. The `*` CSS rule stays for the tap delay and for
browsers that do honour the veto. Android needs neither: `zoomEnabled: false` there is
`setBuiltInZoomControls(false)`, and Android's double-tap zoom exists only when the built-in zoom
controls are on.

⚠️ **When a fix and the accessibility suite disagree, the suite is usually telling you the fix was a
reflex.** Look for the option that satisfies both before reaching to silence one — here the native
config option is also what let the viewport meta stay accessible, so the two were never independent
choices.

### `visually-hidden` is a mixin, not a global class

The bounty board shipped its first screenshot with a button reading _"Choose a crew for Village
Errand Send"_ — the accessible-name span rendering inline. `.visually-hidden` was defined **per
component**, in two other stylesheets, and Angular scopes component styles, so a third screen using
the class got no rule at all.

It is a `@mixin` in `ui/theme.scss` now. ⚠️ Worth recording because of how it failed: not subtly —
it puts a whole sentence on a button — but **silently at authoring time**, and the same trap waits
for any class a component assumes is global.

### Do not use opacity to quiet a row whose text is the whole of what it has to say

Dimming a card dims its text with it. `$muted` is 6.4:1 on `$surface`, and 70% of that is under the
4.5:1 floor. Draw the row as an outline on the page background instead.

The Descent shipped a cleared fight row at `opacity: 0.55`, which took the level and the payout —
the two things a cleared row still says — under the bar along with the name. Replaced by a muted
**name**, exactly as a locked tower row does it.

### ⚠️ An `@empty` block inside a `<ul>` is a serious AXE violation

`@empty` renders its content as a **sibling of the items**, and a `<ul>` may directly contain only
`<li>`. So the obvious authoring — an empty-state message inside the list it is describing the
absence of — puts a non-`<li>` child in a list element and fails `list`.

Move the `@empty` outside the `<ul>`. ⚠️ **It sits on exactly the state a new player sees first**,
which is the worst place for a violation to hide and the least likely to be exercised by a test
fixture holding content.

---

## Modals: `@angular/cdk`, and only that

**`@angular/cdk` is the sanctioned answer for overlays**, unlike Angular Material. It is not a UI
framework — it is an accessibility primitives library. It went in during milestone 6, sat unused for
six milestones, and `ui/reset-dialog.ts` is still the app's only overlay. **Its presence is not a
precedent** for installing anything else speculatively.

Use the headless `Dialog` from `@angular/cdk/dialog` rather than a hand-rolled overlay. Focus
trapping, focus restoration to the control that opened it, `aria-hidden` on everything behind it,
and Escape to dismiss are four things a hand-written dialog gets individually easy and collectively
wrong, and four things AXE and WCAG care about.

Three things wiring it up settled:

- ⚠️ **Override the scroll strategy with `createNoopScrollStrategy()`.** CDK defaults to blocking,
  which works by putting `position: fixed; overflow-y: scroll` on `html` — a fix for a document that
  scrolls, and this one deliberately never does. The backdrop already stops a touch reaching the
  screen underneath.
- **The two prebuilt global stylesheets are no longer needed, and adding them is the mistake now.**
  CDK 22 self-loads both through `_CdkPrivateStyleLoader`. Nothing is wired into `angular.json` and
  the overlay renders correctly without it. The old advice was true and had gone stale.
- **Set `ariaModal: true` explicitly.** CDK supplies `role="dialog"` and hides the background, but
  leaves the flag that tells a screen reader the boundary is real switched off by default.

**Cancel is first in the DOM**, so CDK's initial focus lands on the harmless button and a player who
opened the dialog by mis-tapping can dismiss it with the tap already in flight.

⚠️ **WebKit does not leave focus on a button it was clicked on.** That is a platform convention
rather than a bug, and it means a mouse-driven focus-restoration test asserts nothing there. Open
the dialog with `press('Enter')` — both the state a keyboard user is in, and the only way the
assertion means something in all three browsers.

---

## Backups: covered, which is not the same as safe

Verified rather than assumed. `@capacitor/preferences` on iOS writes to `UserDefaults.standard`,
landing in `Library/Preferences/<bundle>.plist` — inside the backed-up part of the app container.
Android's manifest already carries `android:allowBackup="true"`, so Auto Backup covers
SharedPreferences. **Both platforms back up player saves today, with zero code.**

| Scenario                                   | iOS | Android |
| ------------------------------------------ | --- | ------- |
| New device, restore from backup at setup   | ✅  | ✅      |
| Device erased and restored                 | ✅  | ✅      |
| **App deleted, then re-downloaded**        | ❌  | ✅      |
| App _offloaded_, then re-downloaded        | ✅  | ✅      |
| Backup disabled, or the account over quota | ❌  | ❌      |
| Moving between iOS and Android             | ❌  | ❌      |

**The decision is to rely on this and build nothing** — see [rejected](rejected.md) for export/import
and `NSUbiquitousKeyValueStore`, both declined with a trigger.

The gaps are recorded so nobody mistakes "it is in iCloud" for "it is safe". Deleting an app on iOS
destroys its container, and iOS never restores per-app data on re-download; iCloud Backup restores
at device setup and nowhere else. **"Offload App" preserves data and looks identical to the
player**, which is exactly how this gets misdiagnosed as working. And iCloud's free tier is 5GB, so
a large share of users sit over quota with backups that have silently not completed in months.

⚠️ **The table is read from the platform docs, not from a device.** Verifying it needs a physical
phone and a restore, which the test suite cannot stand in for. It costs one restore, and it is the
same argument milestone 6 made for running on a phone early — which found a bug nothing else would
have. Carry it forward rather than dropping it.

---

## Local notifications: two, ever

Two ship, at 12h and 24h. See [`ui/notifications.service.ts`](../src/ui/notifications.service.ts).

⚠️ **This is a deliberate reversal of an earlier "ship none" decision**, and the original objection
is preserved rather than deleted because it is still why the feature has the shape it has — see
[history](history.md). Every constraint below follows from keeping that objection in view.

- ⚠️ **Cancelled on foreground and on launch.** A player who has come back must not be told to come
  back.
- **Two, ever** — not a daily drumbeat and not one per finished bounty. **Fixed ids**, so
  re-scheduling replaces rather than accumulates.
- **The copy promises nothing is lost, because nothing is.** No expiring reward, no streak, no
  penalty; the spec asserts both the promise and the absence of urgency words. ⚠️ **The guard caught
  the first draft**, whose "Nothing expires and nothing is lost" was true and unmatchable by a regex
  that cannot tell it from "expires soon" — **the copy was reworded rather than the guard weakened.**
- **A setting, defaulting on**, which also cancels anything queued when switched off. Permission is
  requested at the first backgrounding, never at launch.

**The 24-hour reminder and the longest bounty are the same number, and that is not a coincidence** —
a full day is where the board has nothing left to give, so it is the one moment the app has something
concrete to say.

---

## Still deferred

**Foreground/background handling via `@capacitor/app`.** Auto-battle was named as the first feature
that would genuinely care about the difference between a web `visibilitychange` and a real iOS
lifecycle event, and it shipped without needing one: `BattleService` listens for `visibilitychange`
and switches the loop off, and because every battle persists as it ends, a missed lifecycle event
costs exactly one fight. `ui/game-loop.service.ts` covers the save side the same way.

**The trigger is something whose cost on a missed event is _unbounded_ rather than one battle.**
Android's hardware back button arrives with the same dependency — routing shipped in milestone 3 and
gives it somewhere to go, but the handler that pops modals and navigates up, exiting only from the
root, still waits on `@capacitor/app`.
