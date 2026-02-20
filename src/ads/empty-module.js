// Empty shim for react-native-google-mobile-ads
// Used until the package is compatible with New Architecture + Android SDK 36
module.exports = {
  InterstitialAd: { createForAdRequest: () => ({ load: () => {}, show: () => {}, addAdEventListener: () => () => {} }) },
  AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
  BannerAd: () => null,
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
  TestIds: { ADAPTIVE_BANNER: 'test', INTERSTITIAL: 'test' },
  RequestOptions: {},
};
