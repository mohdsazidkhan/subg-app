/**
 * @fileoverview Internationalization configuration for Subg App
 * 
 * This file configures i18next for multi-language support including
 * English and Hindi translations with automatic language detection.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';

/**
 * Custom language detector for i18next
 * Detects user language from AsyncStorage or device settings
 */
const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  /**
   * Detect user's preferred language
   * @param {Function} callback - Callback function to set detected language
   */
  detect: async (callback) => {
    try {
      // Get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // Get device language
      const locales = RNLocalize.getLocales();
      const deviceLanguage = locales[0]?.languageCode || 'en';
      
      // Map device language to supported languages
      const supportedLanguages = ['en', 'hi'];
      const language = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
      
      callback(language);
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  init: () => {},
  /**
   * Cache user's language preference
   * @param {string} lng - Language code to cache
   */
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
    },
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
