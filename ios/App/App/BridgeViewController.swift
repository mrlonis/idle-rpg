import Capacitor
import UIKit
import WebKit

// The shell's one native customisation: WKWebView's one-finger double-tap-to-zoom recogniser is
// switched off, because it is the single zoom gesture `zoomEnabled: false` does not cover and
// the web side has no veto over.
//
// Why this exists, so it is not re-litigated from either direction:
//
// - Capacitor implements `zoomEnabled: false` as `scrollViewWillBeginZooming` disabling the
//   scroll view's *pinch* recogniser (`WebViewDelegationHandler.swift` in the pod source).
//   Double-tap zoom is a separate `UITapGestureRecognizer` on the `WKContentView`, which the
//   pod never touches — so a double-tap could zoom in while the dead pinch recogniser was the
//   only way back out, leaving the player stranded at that scale.
// - The standards answer was tried first and failed on device twice: `touch-action:
//   manipulation` on `html` (milestone 6), then on every element via `*`. Safari honours that
//   veto; WKWebView's own recogniser demonstrably does not.
// - Only public API is used here — walking `gestureRecognizers` and setting `isEnabled` — so
//   there is no App Store exposure. `viewDidAppear` rather than `viewDidLoad` is load-bearing:
//   `WKContentView` installs its recognisers when it joins a window, so an earlier hook walks
//   an empty list and silently fixes nothing. Re-running on every appearance is deliberate and
//   idempotent.
//
// Costs, weighed: the same recogniser family delivers `dblclick` (nothing in `src/` listens for
// it) and double-tap word selection (long-press selection still works, which is all the battle
// log needs). Single taps also stop waiting out the double-tap window, which is pure gain.
// Android needs none of this: `zoomEnabled: false` there is `setBuiltInZoomControls(false)`,
// and Android's double-tap zoom exists only when built-in zoom controls are on.
class BridgeViewController: CAPBridgeViewController {
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        disableDoubleTapZoom()
    }

    private func disableDoubleTapZoom() {
        for subview in webView?.scrollView.subviews ?? [] {
            for recognizer in subview.gestureRecognizers ?? [] {
                if let tap = recognizer as? UITapGestureRecognizer,
                   tap.numberOfTapsRequired == 2,
                   tap.numberOfTouchesRequired == 1 {
                    tap.isEnabled = false
                }
            }
        }
    }
}
