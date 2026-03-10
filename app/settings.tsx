import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useSettings } from '../src/context/SettingsContext';
import { useGame } from '../src/context/GameContext';
import { StorageService } from '../src/services/StorageService';
import { Button } from '../src/components/Button';
import { AdBanner } from '../src/components/AdBanner';
import { colors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { borderRadius, spacing } from '../src/theme/spacing';

type PinModalMode = 'setup' | 'verify' | 'change';

const APP_VERSION = Constants.expoConfig?.version ?? '1.2.0';
const PRIVACY_POLICY_URL = 'https://bilmecelerce.com/gizlilik';
const SUPPORT_EMAIL = 'destek@bilmecelerce.com';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bilmecelerce.app';
// TODO: App Store'a yayınlandıktan sonra gerçek App ID ile güncelle
const APP_STORE_URL = 'https://apps.apple.com/app/bilmecelerce/id0000000000';

export default function SettingsScreen() {
  const { settings, dispatch: settingsDispatch } = useSettings();
  const { dispatch: gameDispatch } = useGame();
  const [resetting, setResetting] = useState(false);

  // PIN modal state
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<PinModalMode>('setup');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const openPinModal = (mode: PinModalMode) => {
    setPinInput('');
    setPinError('');
    setPinModalMode(mode);
    setPinModalVisible(true);
  };

  const closePinModal = () => {
    setPinModalVisible(false);
    setPinInput('');
    setPinError('');
  };

  const handlePinSubmit = () => {
    if (pinInput.length !== 4) {
      setPinError('PIN 4 haneli olmal\u0131d\u0131r.');
      return;
    }

    if (pinModalMode === 'setup') {
      settingsDispatch({ type: 'SET_PIN', payload: pinInput });
      settingsDispatch({ type: 'TOGGLE_PARENTAL_CONTROL' });
      closePinModal();
    } else if (pinModalMode === 'verify') {
      if (pinInput === settings.parentalPin) {
        settingsDispatch({ type: 'TOGGLE_PARENTAL_CONTROL' });
        closePinModal();
      } else {
        setPinError('Yanl\u0131\u015F PIN. Tekrar deneyin.');
        setPinInput('');
      }
    } else if (pinModalMode === 'change') {
      if (pinInput === settings.parentalPin) {
        closePinModal();
        setTimeout(() => openPinModal('setup'), 300);
      } else {
        setPinError('Yanl\u0131\u015F PIN. Tekrar deneyin.');
        setPinInput('');
      }
    }
  };

  const handleParentalToggle = () => {
    if (!settings.parentalControlEnabled) {
      openPinModal('setup');
    } else {
      openPinModal('verify');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Verileri S\u0131f\u0131rla',
      'T\u00FCm ilerleme ve puanlar silinecek. Emin misin?',
      [
        { text: '\u0130ptal', style: 'cancel' },
        {
          text: 'S\u0131f\u0131rla',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            await StorageService.clearAll();
            gameDispatch({ type: 'RESET_GAME' });
            gameDispatch({
              type: 'SET_PROGRESS',
              payload: {
                solvedRiddles: [],
                totalScore: 0,
                currentStreak: 0,
                bestStreak: 0,
                badges: [],
              },
            });
            setResetting(false);
            Alert.alert('Ba\u015Far\u0131l\u0131', 'T\u00FCm veriler s\u0131f\u0131rland\u0131.');
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(url);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };

  const handleSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Bilmecelerce%20Destek`);
  };

  const getPinModalTitle = () => {
    switch (pinModalMode) {
      case 'setup':
        return 'PIN Belirle';
      case 'verify':
        return 'PIN Girin';
      case 'change':
        return 'Mevcut PIN Girin';
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Sound & Music */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'\uD83D\uDD0A'} Ses ve M\u00FCzik</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Ses Efektleri</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={() => settingsDispatch({ type: 'TOGGLE_SOUND' })}
                trackColor={{ false: colors.textLight, true: colors.primaryLight }}
                thumbColor={settings.soundEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.label}>Arka Plan M\u00FCzi\u011Fi</Text>
              <Switch
                value={settings.musicEnabled}
                onValueChange={() => settingsDispatch({ type: 'TOGGLE_MUSIC' })}
                trackColor={{ false: colors.textLight, true: colors.primaryLight }}
                thumbColor={settings.musicEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Parental Control */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'\uD83D\uDD12'} Ebeveyn Kontrol\u00FC</Text>
            <View style={[styles.row, !settings.parentalControlEnabled && styles.rowLast]}>
              <Text style={styles.label}>Ebeveyn Kontrol\u00FC</Text>
              <Switch
                value={settings.parentalControlEnabled}
                onValueChange={handleParentalToggle}
                trackColor={{ false: colors.textLight, true: colors.primaryLight }}
                thumbColor={settings.parentalControlEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
            {settings.parentalControlEnabled && (
              <TouchableOpacity
                style={styles.changePinButton}
                onPress={() => openPinModal('change')}
              >
                <Text style={styles.changePinText}>PIN De\u011Fi\u015Ftir</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* About & Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'\u2139\uFE0F'} Hakk\u0131nda</Text>
            <TouchableOpacity style={styles.linkRow} onPress={handleRateApp}>
              <Text style={styles.linkIcon}>{'\u2B50'}</Text>
              <Text style={styles.linkText}>Uygulamay\u0131 De\u011Ferlendir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={handlePrivacyPolicy}>
              <Text style={styles.linkIcon}>{'\uD83D\uDD12'}</Text>
              <Text style={styles.linkText}>Gizlilik Politikas\u0131</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkRow, styles.rowLast]} onPress={handleSupport}>
              <Text style={styles.linkIcon}>{'\u2709\uFE0F'}</Text>
              <Text style={styles.linkText}>Destek</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerSection}>
            <Button
              title={resetting ? 'S\u0131f\u0131rlan\u0131yor...' : 'T\u00FCm Verileri S\u0131f\u0131rla'}
              onPress={handleClearData}
              variant="outline"
              size="large"
              disabled={resetting}
              style={styles.dangerButton}
              textStyle={styles.dangerText}
            />
          </View>

          {/* Footer with version */}
          <View style={styles.footer}>
            <Text style={styles.version}>Bilmecelerce v{APP_VERSION}</Text>
            <Text style={styles.copyright}>{'\u00C7'}ocuklar i{'\u00E7'}in e{'\u011F'}itici bilmece oyunu</Text>
          </View>
        </ScrollView>
        <AdBanner />
      </SafeAreaView>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePinModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{getPinModalTitle()}</Text>
            <Text style={styles.modalSubtitle}>4 haneli PIN girin</Text>
            <TextInput
              style={[styles.pinInput, pinError ? styles.pinInputError : null]}
              value={pinInput}
              onChangeText={(text) => {
                setPinError('');
                setPinInput(text.replace(/[^0-9]/g, '').slice(0, 4));
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="- - - -"
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closePinModal}>
                <Text style={styles.modalCancelText}>{'\u0130'}ptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handlePinSubmit}>
                <Text style={styles.modalConfirmText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: fonts.sizes.md,
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  comingSoon: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  changePinButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  changePinText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  // About links
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkIcon: {
    fontSize: 18,
    marginRight: spacing.sm + 4,
  },
  linkText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  dangerSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  dangerButton: {
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  version: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    fontWeight: fonts.weights.medium,
  },
  copyright: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  pinInput: {
    width: '100%',
    height: 52,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 12,
    color: colors.text,
    fontWeight: fonts.weights.bold,
  },
  pinInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.textLight,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: fonts.sizes.md,
    color: colors.textLight,
    fontWeight: fonts.weights.medium,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: fonts.sizes.md,
    color: '#FFFFFF',
    fontWeight: fonts.weights.semiBold,
  },
});
