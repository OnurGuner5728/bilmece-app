import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { AgeGroup } from '../types';

/**
 * Bilmecelerce SpeechService
 *
 * Öncelik:
 * 1. Pre-generated MP3 (edge-tts — tr-TR-EmelNeural, gerçek insan sesinden eğitilmiş Neural TTS)
 *    → GitHub CDN'den stream edilir, her cihazda AYNI ses, tutarlı ve doğal
 * 2. Fallback: expo-speech (cihaz native TTS, internet yoksa)
 */

const AUDIO_BASE_URL =
  'https://raw.githubusercontent.com/OnurGuner5728/bilmece-app/master/audio/';

// Yaş grubuna göre expo-av oynatma hızı
const PLAYBACK_RATE: Record<AgeGroup, number> = {
  '4-6': 0.82,  // Yavaş, net — küçük çocuklar için
  '7-9': 0.91,  // Rahat tempo
  '10-12': 1.0, // Normal hız
};

// expo-speech fallback için
const FALLBACK_RATE: Record<AgeGroup, number> = { '4-6': 0.72, '7-9': 0.82, '10-12': 0.92 };
const FALLBACK_PITCH: Record<AgeGroup, number> = { '4-6': 1.25, '7-9': 1.15, '10-12': 1.05 };

let currentSound: Audio.Sound | null = null;
let audioConfigured = false;

async function configureAudio(): Promise<void> {
  if (audioConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    audioConfigured = true;
  } catch {}
}

async function stopCurrentSound(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {}
    currentSound = null;
  }
}

async function playRemoteAudio(audioId: string, ageGroup: AgeGroup): Promise<boolean> {
  const url = `${AUDIO_BASE_URL}${audioId}.mp3`;
  await configureAudio();
  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    {
      shouldPlay: false,
      rate: PLAYBACK_RATE[ageGroup],
      pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
    }
  );
  currentSound = sound;
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && (status as any).didJustFinish) {
      stopCurrentSound();
    }
  });
  await sound.playAsync();
  return true;
}

function nativeFallback(text: string, ageGroup: AgeGroup): void {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: 'tr-TR',
      rate: FALLBACK_RATE[ageGroup],
      pitch: FALLBACK_PITCH[ageGroup],
    });
  } catch {}
}

export const SpeechService = {
  /**
   * @param text      Söylenecek metin (fallback için)
   * @param ageGroup  Yaş grubu (hız ayarı için)
   * @param audioId   Pre-generated ses ID'si (ör: "bilmece_001", "tebrikler", "yanlis")
   *                  Belirtilmezse veya yüklenemezse native TTS devreye girer.
   */
  async speak(text: string, ageGroup: AgeGroup = '7-9', audioId?: string): Promise<void> {
    await stopCurrentSound();

    if (audioId) {
      try {
        await playRemoteAudio(audioId, ageGroup);
        return;
      } catch {
        // Ses yüklenemedi — fallback'e geç
      }
    }

    nativeFallback(text, ageGroup);
  },

  async stop(): Promise<void> {
    await stopCurrentSound();
    try { Speech.stop(); } catch {}
  },

  async isSpeaking(): Promise<boolean> {
    if (currentSound) {
      try {
        const status = await currentSound.getStatusAsync();
        return status.isLoaded && (status as any).isPlaying;
      } catch {}
    }
    try { return Speech.isSpeakingAsync(); } catch { return false; }
  },
};
