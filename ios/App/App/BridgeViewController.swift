import Capacitor
import UIKit
import WebKit

// The shell's one native customisation: zoom, in every form, is made impossible to enter and
// impossible to be stranded in. Three legs, each carrying a different failure that shipped:
//
// 1. WKWebView's one-finger double-tap-to-zoom is blocked with a *dynamic* gesture failure
//    requirement: our recogniser's delegate answers `shouldBeRequiredToFailBy` for every
//    one-finger double-tap recogniser in the hierarchy, so each of WebKit's fires only if ours
//    fails — and ours recognises every one-finger double-tap. Two simpler shapes failed first:
//    `isEnabled = false` decays within a frame, because WebKit re-decides enablement on
//    essentially every rendered commit (`_didCommitLayerTree` → `_setDoubleTapGesturesEnabled:`);
//    and a static `require(toFail:)` walk missed the zoom recogniser outright, because WebKit
//    attaches and detaches its recognisers on its own schedule and a one-shot walk sees only
//    that moment's set. The delegate form is evaluated per gesture, so it covers recognisers
//    WebKit creates at any time, forever.
// 2. Our double-tap action *resets the scale to 1*. WebKit keeps double-tap zoom off only while
//    the page sits exactly at its initial scale (`_allowsDoubleTapGestures`, measured 0 in a
//    clean simulator) and arms it everywhere the moment the scale drifts. Whatever zoomed the
//    page — a pinch leak, a race, anything future — the player's reflex, double-tapping, now
//    restores the app instead of zooming further. Verified against a genuine web-process-backed
//    zoom at 1.8×: the reset returns it to exactly 1.
// 3. The pinch recogniser is disabled whenever we pass by. Capacitor's own `zoomEnabled: false`
//    disables it from inside the first pinch (`scrollViewWillBeginZooming`), which both lets
//    that first pinch leak a scale change — the drift that arms double-tap zoom — and is why a
//    zoomed player is stranded. UIScrollView re-enables the recogniser as it manages zoom state,
//    so this leg is best-effort on top of Capacitor's delegate; leg 2 is what guarantees the
//    stranding still ends.
//
// Everything here is public API: a plain UITapGestureRecognizer, UIGestureRecognizerDelegate,
// `setZoomScale`. `viewDidAppear` rather than `viewDidLoad` is load-bearing — `WKContentView`
// joins the window between the two, and installing against a windowless web view does nothing.
//
// Costs, weighed: the requirement also catches the text-interaction double-tap (word
// selection), which `user-select: none` already makes a no-op everywhere but the battle log,
// where long-press selection still works; and `dblclick` never reaches the page, which nothing
// in `src/` listens for. The two-finger double-tap stays — it can only zoom *out*, which is now
// always a no-op or a rescue. `touch-action: manipulation` stays in the CSS for the tap delay;
// it was measured twice on device to be no veto against WKWebView's own recognisers.
class BridgeViewController: CAPBridgeViewController, UIGestureRecognizerDelegate {
    private var doubleTapBlocker: UITapGestureRecognizer?

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        webView?.scrollView.pinchGestureRecognizer?.isEnabled = false
        installDoubleTapBlocker()
    }

    private func installDoubleTapBlocker() {
        guard doubleTapBlocker == nil, let webView else { return }

        let blocker = UITapGestureRecognizer(target: self, action: #selector(doubleTapRecognized))
        blocker.numberOfTapsRequired = 2
        blocker.numberOfTouchesRequired = 1
        // The page must keep receiving the raw touches — the blocker observes, it never consumes.
        blocker.cancelsTouchesInView = false
        blocker.delaysTouchesEnded = false
        blocker.delegate = self
        webView.addGestureRecognizer(blocker)
        doubleTapBlocker = blocker
    }

    @objc private func doubleTapRecognized() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.pinchGestureRecognizer?.isEnabled = false
        if scrollView.zoomScale != 1 {
            scrollView.setZoomScale(1, animated: false)
        }
    }

    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        guard gestureRecognizer === doubleTapBlocker,
              let tap = otherGestureRecognizer as? UITapGestureRecognizer
        else { return false }
        return tap.numberOfTapsRequired == 2 && tap.numberOfTouchesRequired == 1
    }
}
