import { Audio } from 'expo-av';

/**
 * MusicService — Bilmecelerce arka plan müziği
 *
 * Müzik dosyası GitHub CDN'den yüklenir.
 * Dosya yoksa veya ağ hatası olursa sessizce devam eder.
 */

const MUSIC_URL =
  'https://raw.githubusercontent.com/OnurGuner5728/bilmece-app/master/audio/background_music.mp3';

let musicSound: Audio.Sound | null = null;
let isMusicEnabled = false;
let isInitialized = false;
let isLoading = false;

async function ensureAudioConfigured(): Promise<void> {
  if (isInitialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    isInitialized = true;
  } catch {}
}

export const MusicService = {
  async setEnabled(enabled: boolean): Promise<void> {
    isMusicEnabled = enabled;
    if (enabled) {
      await MusicService.play();
    } else {
      await MusicService.pause();
    }
  },

  async play(): Promise<void> {
    if (!isMusicEnabled) return;
    await ensureAudioConfigured();

    try {
      if (musicSound) {
        const status = await musicSound.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await musicSound.playAsync();
        }
        return;
      }

      if (isLoading) return;
      isLoading = true;

      const { sound } = await Audio.Sound.createAsync(
        { uri: MUSIC_URL },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.25,
        }
      );
      isLoading = false;
      musicSound = sound;
    } catch {
      isLoading = false;
    }
  },

  async pause(): Promise<void> {
    if (!musicSound) return;
    try {
      await musicSound.pauseAsync();
    } catch {}
  },

  async stop(): Promise<void> {
    isMusicEnabled = false;
    isLoading = false;
    if (musicSound) {
      try {
        await musicSound.stopAsync();
        await musicSound.unloadAsync();
      } catch {}
      musicSound = null;
    }
  },
};
