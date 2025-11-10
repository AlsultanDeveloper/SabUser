// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ✅ Exclude 'functions' folder from Metro bundler
// This prevents backend-only packages (like firebase-functions) from being bundled
config.resolver.blockList = [
  /functions\/.*/,
  /node_modules\/firebase-functions\/.*/,
];

// ✅ Don't watch 'functions' folder for changes
config.watchFolders = config.watchFolders || [];
config.resolver.sourceExts = config.resolver.sourceExts || ['js', 'jsx', 'json', 'ts', 'tsx'];

module.exports = config;
