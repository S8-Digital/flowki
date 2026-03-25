const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro picks up changes in shared/
config.watchFolders = [monorepoRoot];

// Resolve packages from both the mobile workspace and the hoisted root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Allow Metro to resolve @flowki/shared directly from source
config.resolver.extraNodeModules = {
  '@flowki/shared': path.resolve(monorepoRoot, 'shared', 'src'),
};

module.exports = config;

