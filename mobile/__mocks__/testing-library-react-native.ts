/**
 * Shim for @testing-library/react-native used in the Vitest test environment.
 *
 * @testing-library/react-native transitively requires react-native, whose
 * index.js contains `import typeof` Flow-type syntax that neither Node.js
 * nor esbuild can parse. Because useRtdb is a pure data hook with no
 * React-Native-specific UI, we can test it with @testing-library/react which
 * has no native dependencies and is already installed in the project.
 *
 * vitest.config.ts aliases `@testing-library/react-native` to this file for
 * the test environment only, so the source and mobile app code are unaffected.
 */
export { renderHook, act, waitFor } from '@testing-library/react';

