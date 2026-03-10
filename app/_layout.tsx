import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProvider } from '../src/context/GameContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import { MusicService } from '../src/services/MusicService';
import { colors } from '../src/theme/colors';

const ONBOARDING_KEY = 'onboarding_done';

function MusicController() {
  const { settings } = useSettings();

  useEffect(() => {
    MusicService.setEnabled(settings.musicEnabled);
  }, [settings.musicEnabled]);

  return null;
}

SplashScreen.preventAutoHideAsync();

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (!value && segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <GameProvider>
          <MusicController />
          <StatusBar style="dark" />
          <OnboardingGate>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background },
                headerShadowVisible: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="index"
                options={{ title: 'Bilmecelerce', headerShown: false }}
              />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="difficulty"
                options={{ title: 'Zorluk Se\u00E7' }}
              />
              <Stack.Screen
                name="game"
                options={{ title: 'Bilmece' }}
              />
              <Stack.Screen
                name="answer"
                options={{ title: 'Cevap', headerBackVisible: false }}
              />
              <Stack.Screen
                name="category"
                options={{ title: 'Kategori' }}
              />
              <Stack.Screen
                name="score"
                options={{ title: 'Skor Tablosu' }}
              />
              <Stack.Screen
                name="settings"
                options={{ title: 'Ayarlar' }}
              />
            </Stack>
          </OnboardingGate>
        </GameProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
