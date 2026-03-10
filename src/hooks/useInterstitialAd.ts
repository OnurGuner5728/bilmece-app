import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useGame } from '../context/GameContext';

const INTERSTITIAL_AD_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : 'ca-app-pub-9813586099759759/3222776000';

let InterstitialAd: any = null;
let AdEventType: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
} catch {
  // ads module not available
}

export function useInterstitialAd() {
  const { dispatch } = useGame();
  const interstitialRef = useRef<any>(null);
  const interstitialLoadedRef = useRef(false);

  useEffect(() => {
    if (!InterstitialAd || Platform.OS === 'web') return;
    try {
      const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_ID, {
        requestNonPersonalizedAdsOnly: true,
        tagForChildDirectedTreatment: true,
        maxAdContentRating: 'G',
      });
      const loadedUnsub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoadedRef.current = true;
      });
      const closedUnsub = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoadedRef.current = false;
        interstitial.load();
      });
      const errorUnsub = interstitial.addAdEventListener(AdEventType.ERROR, () => {
        interstitialLoadedRef.current = false;
      });
      interstitial.load();
      interstitialRef.current = interstitial;
      return () => {
        loadedUnsub();
        closedUnsub();
        errorUnsub();
      };
    } catch {
      // Ad SDK not available
    }
  }, []);

  const showInterstitialAd = useCallback(() => {
    // Her zaman counter'ı resetle (reklam gösterilse de gösterilmese de)
    dispatch({ type: 'RESET_AD_COUNTER' });
    if (interstitialRef.current && interstitialLoadedRef.current) {
      interstitialRef.current.show();
    }
  }, [dispatch]);

  return { showInterstitialAd };
}
