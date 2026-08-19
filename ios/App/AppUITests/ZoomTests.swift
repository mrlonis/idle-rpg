import XCTest

// Regression guard for the double-tap-zoom trap (see BridgeViewController.swift): a real
// double-tap — injected through the system, the only faithful way to exercise WKWebView's
// gesture graph — must never leave the page zoomed. The first double-tap is allowed to *change*
// things: it is the escape hatch, and if the app was already zoomed it snaps the scale back to
// 1. Every double-tap after that must be a no-op, asserted by element frames holding still —
// when the scroll view zooms, every accessibility frame scales with it.
//
// The test attaches to the running app rather than relaunching it (`activate`, not `launch`),
// so a deliberately pre-zoomed state — set up by the harness driving this test — survives into
// the first double-tap and proves the rescue path.
final class ZoomTests: XCTestCase {
    func testDoubleTapNeverLeavesThePageZoomed() {
        let app = XCUIApplication(bundleIdentifier: "com.mrlonis.idlerpg")
        app.activate()
        sleep(2)

        let mid = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.55))

        // Rescue, twice: the first synthesized gesture after activation can be swallowed by the
        // foreground transition, and a double-tap must land the app at scale 1 from any starting
        // state. After these two, the state must be a fixed point.
        mid.doubleTap()
        sleep(1)
        mid.doubleTap()
        sleep(1)

        let probe = app.staticTexts.firstMatch
        XCTAssertTrue(probe.waitForExistence(timeout: 5))
        let settled = probe.frame
        // Absolute un-zoomed sanity: at 1.8x the heading's accessibility frame lands far outside
        // the window, so containment fails if a zoom survived the rescues.
        XCTAssertTrue(app.windows.firstMatch.frame.contains(settled))

        // From a settled state, double-taps must change nothing.
        for _ in 1...2 {
            mid.doubleTap()
            sleep(1)
            let now = probe.frame
            XCTAssertEqual(now.origin.x, settled.origin.x, accuracy: 0.5)
            XCTAssertEqual(now.origin.y, settled.origin.y, accuracy: 0.5)
            XCTAssertEqual(now.size.width, settled.size.width, accuracy: 0.5)
            XCTAssertEqual(now.size.height, settled.size.height, accuracy: 0.5)
        }
    }
}
