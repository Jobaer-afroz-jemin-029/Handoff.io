// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore problematic directories that are corrupted
config.watchFolders = config.watchFolders || [];
config.resolver = config.resolver || {};

// Block corrupted directories using blockList (array of regex patterns)
if (!config.resolver.blockList) {
  config.resolver.blockList = [];
}

// Convert to array if it's not already
if (!Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList = [config.resolver.blockList].filter(Boolean);
}

// Add patterns to block corrupted directories
config.resolver.blockList.push(
  /node_modules\/\.react-native-.*\/ReactCommon\/react\/renderer/,
  /node_modules\/react-native-screens\/lib\/commonjs\/native-stack\/views/,
  /node_modules\/react-native-screens\/lib\/module\/native-stack\/views/
);

// Use unstable_allowRequireContext to help with file watching issues
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

