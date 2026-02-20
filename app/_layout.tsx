import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { GameProvider } from '../src/context/GameContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <GameProvider>
          <StatusBar style="dark" />
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
              name="difficulty"
              options={{ title: 'Zorluk Seç' }}
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
        </GameProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
