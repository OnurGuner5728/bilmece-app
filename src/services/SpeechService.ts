import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { AgeGroup } from '../types';

// Yas grubuna gore konusma hizi — cocuklar icin daha yavas ve net
const SPEECH_RATES: Record<AgeGroup, number> = {
    '4-6': 0.72,   // Cok kucuk cocuklar: belirgin yavas ve net
    '7-9': 0.82,   // Okul cagi: rahat ve takip edilebilir
    '10-12': 0.92, // Buyuk cocuklar: dogal konusma temposuna yakin
};

// Yas grubuna gore ses tonu — yuksek pitch sicak ve cocuk dostu
const SPEECH_PITCH: Record<AgeGroup, number> = {
    '4-6': 1.25,   // Neseli ve canli ton
    '7-9': 1.15,   // Sicak ve dostane ton
    '10-12': 1.05, // Dogal ama biraz vurgulanmis ton
};

// Module-level cache for the best Turkish voice
let cachedVoice: Speech.Voice | null = null;
let voiceResolved = false;

async function findBestTurkishVoice(): Promise<Speech.Voice | null> {
    if (voiceResolved) return cachedVoice;

    try {
        const voices = await Speech.getAvailableVoicesAsync();
        const turkishVoices = voices.filter(
            (v) => v.language === 'tr-TR' || v.language === 'tr_TR' || v.language.startsWith('tr'),
        );

        if (turkishVoices.length === 0) {
            voiceResolved = true;
            return null;
        }

        let selected: Speech.Voice | null = null;

        if (Platform.OS === 'android') {
            // Prefer enhanced/network voices with tr-TR or tr_TR identifier
            const enhanced = turkishVoices.filter(
                (v) =>
                    (v.identifier.includes('tr-TR') || v.identifier.includes('tr_TR')) &&
                    (v.quality === Speech.VoiceQuality.Enhanced || v.quality === Speech.VoiceQuality.Default),
            );

            // Among enhanced, prefer network voices
            const network = enhanced.find((v) => v.name.toLowerCase().includes('network'));
            selected = network ?? enhanced[0] ?? null;
        } else if (Platform.OS === 'ios') {
            // Prefer Yelda or Siri Turkish voice
            selected =
                turkishVoices.find((v) => v.name.includes('Yelda')) ??
                turkishVoices.find((v) => v.name.includes('Siri')) ??
                null;
        }

        // Fallback: any Turkish voice
        if (!selected) {
            selected = turkishVoices[0];
        }

        cachedVoice = selected;
    } catch {
        // getAvailableVoicesAsync failed — silently fall back to no specific voice
        cachedVoice = null;
    }

    voiceResolved = true;
    return cachedVoice;
}

export const SpeechService = {
    async speak(text: string, ageGroup: AgeGroup = '7-9'): Promise<void> {
        Speech.stop();

        const voice = await findBestTurkishVoice();

        const options: Speech.SpeechOptions = {
            language: 'tr-TR',
            rate: SPEECH_RATES[ageGroup],
            pitch: SPEECH_PITCH[ageGroup],
        };

        if (voice) {
            options.voice = voice.identifier;
        }

        Speech.speak(text, options);
    },

    stop(): void {
        Speech.stop();
    },

    async isSpeaking(): Promise<boolean> {
        return Speech.isSpeakingAsync();
    },
};
