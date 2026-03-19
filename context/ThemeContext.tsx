import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    // Load saved theme preference
    async function loadTheme() {
      const savedTheme = await SecureStore.getItemAsync('themeMode');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setMode(savedTheme);
      } else {
        // Fallback to light by default as requested by user
        setMode('light');
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await SecureStore.setItemAsync('themeMode', newMode);
  };

  const setTheme = async (newMode: ThemeMode) => {
    setMode(newMode);
    await SecureStore.setItemAsync('themeMode', newMode);
  };

  const value = {
    mode,
    isDark: mode === 'dark',
    colors: mode === 'dark' ? Colors.dark : Colors.light,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
