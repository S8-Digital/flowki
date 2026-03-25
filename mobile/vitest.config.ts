import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    // settings.tsx (and other component files) use JSX without an explicit
    // `import React` — enable the automatic JSX transform so esbuild injects
    // the runtime import rather than expecting a global React variable.
    jsx: 'automatic',
  },
  test: {
    // jsdom is required by @testing-library/react (used as shim for
    // @testing-library/react-native) — jsdom is installed in the root workspace.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    // expo/tsconfig.base sets customConditions: ['react-native'] which Vitest
    // inherits from tsconfig and passes to Vite's resolver. Explicit conditions
    // here override that to avoid resolving packages to their raw TypeScript
    // source via the react-native export condition.
    conditions: ['node', 'require', 'default'],
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@flowki/shared': path.resolve(__dirname, '../shared/src'),
      // react-native/index.js contains `import typeof` Flow syntax that
      // Node.js/esbuild cannot parse. Redirect to a pre-compiled stub so that
      // component tests (and any hook that transitively imports RN) work in jsdom.
      'react-native': path.resolve(__dirname, './__mocks__/react-native.ts'),
      // @testing-library/react-native transitively requires react-native whose
      // index.js contains `import typeof` Flow syntax that Node.js/esbuild
      // cannot parse. Since useRtdb is a pure data hook with no RN-specific UI,
      // we redirect to a thin shim that re-exports renderHook/act from
      // @testing-library/react (which has no native dependencies).
      '@testing-library/react-native': path.resolve(
        __dirname,
        './__mocks__/testing-library-react-native.ts',
      ),
    },
  },
});
