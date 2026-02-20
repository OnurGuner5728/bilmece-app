const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Temporary shim for react-native-google-mobile-ads
// Remove this when adding real AdMob integration after store release
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    'react-native-google-mobile-ads': require.resolve('./src/ads/empty-module.js'),
  },
};

module.exports = config;
