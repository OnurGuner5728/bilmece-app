import AsyncStorage from '@react-native-async-storage/async-storage';
import { GLView } from 'expo-gl';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  GameMode,
  InputState,
  LEVELS,
  STORAGE_KEY,
  clamp,
  makeGame,
  triggerPulse,
  updateGame,
} from '../src/sonisik/core';
import { createRenderer, renderScene } from '../src/sonisik/renderer';
import { styles } from '../src/sonisik/styles';

function HoldKey({ label, onChange, style }: { label: string; onChange: (pressed: boolean) => void; style?: object }) {
  return (
    <Pressable
      onPressIn={() => onChange(true)}
      onPressOut={() => onChange(false)}
      style={({ pressed }) => [styles.dpadKey, style, pressed && styles.dpadKeyPressed]}
    >
      <Text style={styles.dpadLabel}>{label}</Text>
    </Pressable>
  );
}

export default function SonIsik() {
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<GameMode>('menu');
  const [unlocked, setUnlocked] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [stars, setStars] = useState(0);
  const [hud, setHud] = useState({ health: 100, energy: 100, lights: 0 });

  const gameRef = useRef(makeGame(0));
  const inputRef = useRef<InputState>({ up: false, down: false, left: false, right: false });
  const modeRef = useRef<GameMode>('menu');
  const unlockedRef = useRef(1);
  const starsRef = useRef(0);
  const completedRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const uiElapsedRef = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const data = JSON.parse(raw) as { unlocked?: number; stars?: number; completed?: number[] };
        const savedUnlocked = clamp(Number(data.unlocked || 1), 1, LEVELS.length);
        const savedStars = Math.max(0, Number(data.stars || 0));
        const completed = Array.isArray(data.completed) ? data.completed.filter((v) => Number.isInteger(v) && v >= 0 && v < LEVELS.length) : [];
        unlockedRef.current = savedUnlocked;
        starsRef.current = savedStars;
        completedRef.current = completed;
        setUnlocked(savedUnlocked);
        setStars(savedStars);
      } catch {
        // Corrupt local progress should never block the game.
      }
    });
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const setGameMode = (next: GameMode) => {
    modeRef.current = next;
    setMode(next);
  };

  const startLevel = (index: number) => {
    const safe = clamp(index, 0, unlockedRef.current - 1);
    setSelectedLevel(safe);
    gameRef.current = makeGame(safe);
    inputRef.current = { up: false, down: false, left: false, right: false };
    lastFrameRef.current = 0;
    uiElapsedRef.current = 0;
    setHud({ health: 100, energy: 100, lights: 0 });
    setGameMode('playing');
  };

  const persistWin = (levelIndex: number, health: number) => {
    const firstClear = !completedRef.current.includes(levelIndex);
    const earned = health >= 75 ? 3 : health >= 40 ? 2 : 1;
    const nextUnlocked = Math.max(unlockedRef.current, Math.min(LEVELS.length, levelIndex + 2));
    const nextCompleted = firstClear ? [...completedRef.current, levelIndex] : completedRef.current;
    const nextStars = firstClear ? starsRef.current + earned : starsRef.current;

    unlockedRef.current = nextUnlocked;
    starsRef.current = nextStars;
    completedRef.current = nextCompleted;
    setUnlocked(nextUnlocked);
    setStars(nextStars);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked: nextUnlocked, stars: nextStars, completed: nextCompleted }));
  };

  const updateFrame = (dt: number, now: number) => {
    if (modeRef.current !== 'playing') return;
    const game = gameRef.current;
    const result = updateGame(game, inputRef.current, dt, now);
    uiElapsedRef.current += dt;
    if (uiElapsedRef.current >= 0.12) {
      uiElapsedRef.current = 0;
      setHud({ health: result.health, energy: result.energy, lights: result.lights });
    }
    if (result.lost && !game.ended) {
      game.ended = true;
      setGameMode('lost');
    } else if (result.won && !game.ended) {
      game.ended = true;
      persistWin(game.level, result.health);
      setGameMode('won');
    }
  };

  const onContextCreate = (gl: any) => {
    const renderer = createRenderer(gl);
    const loop = (timestamp: number) => {
      const seconds = timestamp / 1000;
      const previous = lastFrameRef.current || seconds;
      const dt = clamp(seconds - previous, 0, 0.033);
      lastFrameRef.current = seconds;
      updateFrame(dt, seconds);
      renderScene(gl, renderer, gameRef.current, seconds);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const pulse = () => {
    if (modeRef.current !== 'playing') return;
    if (triggerPulse(gameRef.current)) {
      setHud((old) => ({ ...old, energy: gameRef.current.energy }));
    }
  };

  const currentLevel = LEVELS[gameRef.current.level];
  const mission = hud.lights >= currentLevel.required ? 'FENERE ULAŞ' : `${hud.lights}/${currentLevel.required} IŞIK`;
  const hearts = Math.max(0, Math.ceil(hud.health / 25));
  const landscape = width >= height;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />

      {mode === 'menu' && (
        <View style={styles.menuOverlay}>
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>3D IŞIK MACERASI</Text>
            <Text style={styles.title}>SON IŞIK</Text>
            <Text style={styles.subtitle}>Yüzen adaları keşfet. Işık parçalarını topla. Gölgeleri darbeyle uzaklaştır ve son feneri yak.</Text>
            <Pressable style={styles.primaryButton} onPress={() => startLevel(selectedLevel)}>
              <Text style={styles.primaryButtonText}>OYNA</Text>
            </Pressable>
            <View style={styles.statRow}>
              <View style={styles.statPill}><Text style={styles.statValue}>{unlocked}/{LEVELS.length}</Text><Text style={styles.statLabel}>ADA</Text></View>
              <View style={styles.statPill}><Text style={styles.statValue}>{stars}</Text><Text style={styles.statLabel}>YILDIZ</Text></View>
              <View style={styles.statPill}><Text style={styles.statValue}>OFFLINE</Text><Text style={styles.statLabel}>MOD</Text></View>
            </View>
          </View>

          <View style={styles.levelStrip}>
            {LEVELS.map((level, i) => {
              const locked = i >= unlocked;
              return (
                <Pressable
                  key={level.name}
                  disabled={locked}
                  onPress={() => setSelectedLevel(i)}
                  style={[styles.levelCard, i === selectedLevel && styles.levelCardActive, locked && styles.levelCardLocked]}
                >
                  <Text style={styles.levelNo}>{locked ? '◆' : `0${i + 1}`}</Text>
                  <Text numberOfLines={1} style={styles.levelName}>{locked ? 'Kilitli' : level.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {mode === 'playing' && (
        <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.hudTop} pointerEvents="none">
            <View style={styles.hudChip}>
              <Text style={styles.hudTiny}>{currentLevel.name.toUpperCase()}</Text>
              <Text style={styles.hudMain}>{mission}</Text>
            </View>
            <View style={styles.healthChip}>
              <Text style={styles.healthText}>{'◆'.repeat(hearts)}{'◇'.repeat(4 - hearts)}</Text>
              <View style={styles.energyTrack}><View style={[styles.energyFill, { width: `${hud.energy}%` }]} /></View>
            </View>
          </View>

          <View style={styles.controls} pointerEvents="box-none">
            <View style={styles.dpad}>
              <HoldKey label="▲" style={styles.upKey} onChange={(v) => { inputRef.current.up = v; }} />
              <HoldKey label="◀" style={styles.leftKey} onChange={(v) => { inputRef.current.left = v; }} />
              <HoldKey label="▶" style={styles.rightKey} onChange={(v) => { inputRef.current.right = v; }} />
              <HoldKey label="▼" style={styles.downKey} onChange={(v) => { inputRef.current.down = v; }} />
            </View>
            <View style={styles.actionWrap}>
              <Pressable onPress={pulse} style={({ pressed }) => [styles.pulseButton, hud.energy < 35 && styles.pulseDisabled, pressed && styles.pulsePressed]}>
                <Text style={styles.pulseIcon}>✦</Text><Text style={styles.pulseText}>DARBE</Text><Text style={styles.pulseCost}>35</Text>
              </Pressable>
            </View>
          </View>
          {!landscape && <Text style={styles.rotateHint}>En iyi deneyim için telefonu yatay tut.</Text>}
        </SafeAreaView>
      )}

      {(mode === 'won' || mode === 'lost') && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultKicker}>{mode === 'won' ? 'FENER YANDI' : 'GÖLGELER KAZANDI'}</Text>
            <Text style={styles.resultTitle}>{mode === 'won' ? 'Ada Aydınlandı' : 'Işık Söndü'}</Text>
            <Text style={styles.resultText}>
              {mode === 'won'
                ? (gameRef.current.level === LEVELS.length - 1 ? 'Son ışığı yaktın. Gece geri çekildi.' : `${currentLevel.name} yeniden nefes alıyor.`)
                : 'Darbe enerjini sakla, gölgeler yaklaşınca kullan ve hareket etmeye devam et.'}
            </Text>
            <View style={styles.resultButtons}>
              <Pressable style={styles.secondaryButton} onPress={() => setGameMode('menu')}><Text style={styles.secondaryButtonText}>MENÜ</Text></Pressable>
              <Pressable
                style={styles.primaryButtonSmall}
                onPress={() => {
                  if (mode === 'won' && gameRef.current.level < LEVELS.length - 1) startLevel(gameRef.current.level + 1);
                  else startLevel(gameRef.current.level);
                }}
              >
                <Text style={styles.primaryButtonText}>{mode === 'won' && gameRef.current.level < LEVELS.length - 1 ? 'SONRAKİ ADA' : 'TEKRAR'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
