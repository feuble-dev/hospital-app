import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  success: string;
  warning: string;
  error: string;
  shadow: string;
}

const lightTheme: ThemeColors = {
  background: '#f0f4f8',
  surface: '#ffffff',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  card: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  shadow: '#000000',
};

const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  primary: '#818cf8',
  secondary: '#a78bfa',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  card: '#1e293b',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  shadow: '#000000',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setMode(savedTheme);
      }
    } catch (error) {
      console.log('Erreur chargement thème:', error);
    }
  };

  const saveTheme = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme', newMode);
    } catch (error) {
      console.log('Erreur sauvegarde thème:', error);
    }
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    saveTheme(newMode);
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  const colors = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
