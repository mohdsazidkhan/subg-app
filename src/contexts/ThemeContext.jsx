/**
 * @fileoverview Theme Context for Subg App
 * 
 * This context provides theme management functionality including
 * light/dark mode switching and color palette management.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Light theme color palette
 */
const lightColors = {
  primary: '#EF4444', // Red-500
  secondary: '#F59E0B', // Yellow-500 (Amber-500)
  accent: '#06B6D4', // Cyan-500
  background: '#FFFFFF', // White
  backgroundGradient: ['#fff4f4', '#ffffff', '#fffaea'], // Light gradient
  surface: '#F8FAFC', // Slate-50
  text: '#0F172A', // Slate-900 - darker for better contrast
  textSecondary: '#475569', // Slate-600 - darker for better contrast
  border: '#E2E8F0', // Slate-200
  success: '#10B981', // Emerald-500
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500
};

/**
 * Dark theme color palette
 */
const darkColors = {
  primary: '#EF4444', // Red-500
  secondary: '#F59E0B', // Yellow-500 (Amber-500)
  accent: '#06B6D4', // Cyan-500
  background: '#0F172A', // Slate-900 - darker background
  backgroundGradient: ['#1c1628', '#0f0e12', '#272009'], // Dark gradient
  surface: '#1E293B', // Slate-800 - lighter surface
  text: '#F8FAFC', // Slate-50 - lighter text
  textSecondary: '#CBD5E1', // Slate-300 - lighter secondary text
  border: '#475569', // Slate-600 - lighter border
  success: '#10B981', // Emerald-500
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500
};

/**
 * Theme context for managing app theme
 */
const ThemeContext = createContext(undefined);

/**
 * Theme Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('system');
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Load theme preference from AsyncStorage
   * @returns {Promise<void>} Promise that resolves when theme is loaded
   */
  const loadThemePreference = async () => {
    try {
      // Prefer new themeMode key; fallback to legacy 'theme' key
      const savedThemeMode = await AsyncStorage.getItem('themeMode');
      if (savedThemeMode === 'system' || savedThemeMode === 'light' || savedThemeMode === 'dark') {
        setThemeModeState(savedThemeMode);
        return;
      }

      const legacyTheme = await AsyncStorage.getItem('theme');
      if (legacyTheme === 'dark' || legacyTheme === 'light') {
        const legacyMode = legacyTheme === 'dark' ? 'dark' : 'light';
        setThemeModeState(legacyMode);
        await AsyncStorage.setItem('themeMode', legacyMode);
        return;
      }

      setThemeModeState('system');
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  /**
   * Set theme mode
   * @param {string} mode - Theme mode ('system', 'light', or 'dark')
   * @returns {Promise<void>} Promise that resolves when theme is set
   */
  const setThemeMode = async (mode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  /**
   * Toggle between light and dark themes
   * @returns {Promise<void>} Promise that resolves when theme is toggled
   */
  const toggleTheme = async () => {
    // If following system, switch to explicit light/dark opposite of current
    if (themeMode === 'system') {
      const targetMode = isDark ? 'light' : 'dark';
      await setThemeMode(targetMode);
      return;
    }

    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  const colors = isDark ? darkColors : lightColors;

  // Ensure colors object is always available
  const safeColors = colors || lightColors;

  const value = {
    colors: safeColors,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * @returns {Object} Theme context value
 * @throws {Error} If used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
