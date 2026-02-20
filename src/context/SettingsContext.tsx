import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SettingsState } from '../types';
import { StorageService } from '../services/StorageService';

type SettingsAction =
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'TOGGLE_PARENTAL_CONTROL' }
  | { type: 'SET_PIN'; payload: string }
  | { type: 'LOAD_SETTINGS'; payload: SettingsState };

interface SettingsContextValue {
  settings: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
}

const initialSettings: SettingsState = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  parentalControlEnabled: false,
  parentalPin: '',
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'TOGGLE_MUSIC':
      return { ...state, musicEnabled: !state.musicEnabled };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsEnabled: !state.notificationsEnabled };
    case 'TOGGLE_PARENTAL_CONTROL':
      return { ...state, parentalControlEnabled: !state.parentalControlEnabled };
    case 'SET_PIN':
      return { ...state, parentalPin: action.payload };
    case 'LOAD_SETTINGS':
      return action.payload;
    default:
      return state;
  }
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  useEffect(() => {
    StorageService.getSettings().then((saved) => {
      if (saved) {
        dispatch({ type: 'LOAD_SETTINGS', payload: saved });
      }
    });
  }, []);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
