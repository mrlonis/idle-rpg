import type { CapacitorConfig } from '@capacitor/cli';

// The app's page colour, duplicated from `src/ui/theme.scss`'s `$page` and `src/styles.scss`.
// Sass cannot reach a TypeScript config, so this is the one copy that has to be kept by hand.
const PAGE = '#12121a';

const config: CapacitorConfig = {
  appId: 'com.mrlonis.idlerpg',
  appName: 'Idle RPG',
  webDir: 'dist/idle-rpg/browser',

  // Without this, `CAPBridgeViewController` falls back to `UIColor.systemBackground` for the
  // native window and scroll view — white in light mode. That is what shows for a frame before
  // the first paint, and anywhere the web content does not reach.
  backgroundColor: PAGE,

  ios: {
    backgroundColor: PAGE,
    // Both already match Capacitor 8's defaults. They are stated rather than inherited because
    // a silent default is not a decision anyone can find later: pinch-zoom is off because a
    // shelled app has no chrome to zoom back out with, and the scroll view adds no inset of its
    // own because safe areas are handled in CSS via env(safe-area-inset-*).
    zoomEnabled: false,
    contentInset: 'never',
  },

  android: {
    backgroundColor: PAGE,
    zoomEnabled: false,
  },
};

export default config;
