/**
 * withAppActions.js
 *
 * Expo config plugin that wires up Android App Actions for Google Assistant
 * voice commands and static launcher shortcuts (long-press the app icon).
 *
 * It performs the following modifications to the Android project:
 *
 *  1. Copies `plugins/AppActions/shortcuts.xml` into the Android resource
 *     directory (`android/app/src/main/res/xml/shortcuts.xml`).
 *  2. Adds a `<meta-data android:name="android.app.shortcuts" …>` element to
 *     the main activity in `AndroidManifest.xml` so the OS discovers the
 *     shortcuts and App Action capabilities at runtime.
 *
 * The shortcuts.xml declares:
 *   - Static launcher shortcuts (long-press the app icon → quick actions)
 *   - Google Assistant capabilities using Built-in Intents (BIIs) that open
 *     the app via deep links handled by useAppIntentHandler.ts
 *
 * Usage in app.json:
 *   "plugins": ["./plugins/withAppActions"]
 */

const fs = require('fs');
const path = require('path');
const { withAndroidManifest } = require('@expo/config-plugins');

const SHORTCUTS_SRC = path.join(__dirname, 'AppActions', 'shortcuts.xml');

// ── 1. Copy shortcuts.xml into android/app/src/main/res/xml/ ──────────────

/**
 * Writes shortcuts.xml to the Android resource directory during the prebuild
 * phase so it is bundled into the APK/AAB as @xml/shortcuts.
 *
 * @param {string} androidRoot  Absolute path to the `android/` directory.
 */
function copyShortcutsXml(androidRoot) {
  const xmlDir = path.join(androidRoot, 'app', 'src', 'main', 'res', 'xml');

  if (!fs.existsSync(xmlDir)) {
    fs.mkdirSync(xmlDir, { recursive: true });
  }

  try {
    fs.copyFileSync(SHORTCUTS_SRC, path.join(xmlDir, 'shortcuts.xml'));
  } catch (err) {
    throw new Error(
      `[withAppActions] Failed to copy shortcuts.xml from "${SHORTCUTS_SRC}". ` +
        `Ensure the file exists at mobile/plugins/AppActions/shortcuts.xml before running expo prebuild. ` +
        `Original error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// ── 2. Patch AndroidManifest.xml — add <meta-data> to the main activity ────

/**
 * Returns the object representation of the main launcher activity from the
 * parsed AndroidManifest.json, or `undefined` if none is found.
 *
 * @param {object} manifest  The modResults from withAndroidManifest.
 * @returns {object | undefined}
 */
function findMainActivity(manifest) {
  const application = manifest.manifest.application?.[0];

  if (!application) {
    return undefined;
  }

  const activities = application.activity ?? [];

  // The main activity is the one that has a MAIN + LAUNCHER intent filter.
  return activities.find((activity) => {
    const filters = activity['intent-filter'] ?? [];

    return filters.some((filter) => {
      const actions = (filter.action ?? []).map((a) => a.$?.['android:name'] ?? '');
      const categories = (filter.category ?? []).map((c) => c.$?.['android:name'] ?? '');

      return (
        actions.includes('android.intent.action.MAIN') &&
        categories.includes('android.intent.category.LAUNCHER')
      );
    });
  });
}

/**
 * Ensures the main activity in AndroidManifest.xml contains:
 *
 *   <meta-data
 *       android:name="android.app.shortcuts"
 *       android:resource="@xml/shortcuts" />
 *
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
function withShortcutsManifest(config) {
  return withAndroidManifest(config, (mod) => {
    const androidRoot = mod.modRequest.platformProjectRoot;

    // Copy the XML file first so it is always up-to-date.
    copyShortcutsXml(androidRoot);

    const activity = findMainActivity(mod.modResults);

    if (!activity) {
      console.warn(
        '[withAppActions] Could not find main launcher activity in AndroidManifest.xml — ' +
          'the shortcuts.xml meta-data will not be injected. ' +
          'Verify that your AndroidManifest.xml contains an activity with both ' +
          'android.intent.action.MAIN and android.intent.category.LAUNCHER intent filters.',
      );

      return mod;
    }

    // Ensure the meta-data array exists.
    if (!activity['meta-data']) {
      activity['meta-data'] = [];
    }

    const SHORTCUTS_META_NAME = 'android.app.shortcuts';

    // Skip if already added (idempotent prebuild runs).
    const alreadyAdded = activity['meta-data'].some(
      (m) => m.$?.['android:name'] === SHORTCUTS_META_NAME,
    );

    if (!alreadyAdded) {
      activity['meta-data'].push({
        $: {
          'android:name': SHORTCUTS_META_NAME,
          'android:resource': '@xml/shortcuts',
        },
      });
    }

    return mod;
  });
}

// ── Compose all modifications ─────────────────────────────────────────────────

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
function withAppActions(config) {
  config = withShortcutsManifest(config);

  return config;
}

module.exports = withAppActions;
