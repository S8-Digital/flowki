/**
 * withAppIntents.js
 *
 * Expo config plugin that wires up iOS App Intents (iOS 16+) for Siri voice
 * commands. It performs the following modifications to the Xcode project:
 *
 *  1. Adds the Siri capability entitlement (`com.apple.developer.siri`).
 *  2. Injects `FLOWKI_API_URL` into the main app target's Info.plist so the
 *     Swift intents can resolve the backend URL at runtime.
 *  3. Copies the Swift source files from `plugins/AppIntents/` into the iOS
 *     native project and adds them to the main app target's compile-sources
 *     build phase.
 *  4. Links `AppIntents.framework` against the main app target.
 *
 * Usage in app.json:
 *   "plugins": ["./plugins/withAppIntents"]
 */

const {
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SWIFT_FILES = ['FlowkiIntents.swift', 'FlowkiShortcutsApp.swift'];
const SOURCE_DIR = path.join(__dirname, 'AppIntents');

// ── 1. Siri entitlement ───────────────────────────────────────────────────────

function withSiriEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    mod.modResults['com.apple.developer.siri'] = true;
    return mod;
  });
}

// ── 2. Info.plist — API URL ───────────────────────────────────────────────────

function withApiUrlInfoPlist(config) {
  return withInfoPlist(config, (mod) => {
    // Prefer the runtime env var; fall back to the Expo extra value or production URL.
    const apiUrl =
      process.env.EXPO_PUBLIC_API_URL ||
      (config.extra && config.extra.apiUrl) ||
      'https://flowki.family';
    mod.modResults['FLOWKI_API_URL'] = apiUrl;
    return mod;
  });
}

// ── 3 & 4. Xcode project — Swift sources + AppIntents.framework ──────────────

function withAppIntentsXcode(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const projectRoot = mod.modRequest.projectRoot;
    const iosRoot = path.join(projectRoot, 'ios');

    // Destination for the Swift files inside the iOS native project.
    const destDir = path.join(iosRoot, 'AppIntents');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Locate the main app target (the first non-test native target).
    const nativeTargets = project.pbxNativeTargetSection();
    const mainTarget = Object.values(nativeTargets).find(
      (t) =>
        t && typeof t === 'object' && t.productType === '"com.apple.product-type.application"',
    );

    if (!mainTarget) {
      console.warn('[withAppIntents] Could not find main app target — skipping Swift source injection.');
      return mod;
    }

    for (const filename of SWIFT_FILES) {
      const src = path.join(SOURCE_DIR, filename);
      const dest = path.join(destDir, filename);

      // Copy source file into the iOS project directory.
      fs.copyFileSync(src, dest);

      // Check whether this file is already tracked in the Xcode project.
      const existingFile = Object.values(project.pbxFileReferenceSection?.() ?? {}).find(
        (ref) => ref && ref.path && ref.path.replace(/"/g, '') === `AppIntents/${filename}`,
      );

      if (!existingFile) {
        // Add the file reference + build file to the main app target.
        const fileRef = project.addSourceFile(`AppIntents/${filename}`, {}, mainTarget.uuid);
        if (fileRef) {
          project.addToPbxSourcesBuildPhase(fileRef, mainTarget.uuid);
        }
      }
    }

    // Link AppIntents.framework if not already present.
    const frameworksBuildPhase = project.pbxFrameworksBuildPhaseObj(mainTarget.uuid);
    const alreadyLinked =
      frameworksBuildPhase &&
      frameworksBuildPhase.files &&
      frameworksBuildPhase.files.some(
        (f) => f && f.comment && f.comment.includes('AppIntents.framework'),
      );

    if (!alreadyLinked) {
      project.addFramework('AppIntents.framework', {
        weak: true, // Weak-link so the app still runs on iOS 15 (intents simply won't activate).
        target: mainTarget.uuid,
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
function withAppIntents(config) {
  config = withSiriEntitlement(config);
  config = withApiUrlInfoPlist(config);
  config = withAppIntentsXcode(config);
  return config;
}

module.exports = withAppIntents;
