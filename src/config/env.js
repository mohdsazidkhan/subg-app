/**
 * @fileoverview Environment configuration for Subg App
 * 
 * This file handles environment variables and configuration settings
 * with fallbacks for development and production environments.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

/* Lightweight env accessor that works even if react-native-config isn't installed yet */
let RNConfig = {};
try {
  RNConfig = require('react-native-config');
} catch (_) {
  RNConfig = {};
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Fallback value if key not found
 * @returns {string} Environment variable value or fallback
 */
const fromEnv = (key, fallback) => {
  const v = RNConfig?.[key] ?? process?.env?.[key];
  return typeof v === 'string' && v.length > 0 ? v : fallback;
};

/**
 * Social media links configuration
 * @type {Object}
 */
export const SOCIAL_LINKS = {
  INSTAGRAM_URL: fromEnv('INSTAGRAM_URL', 'https://www.instagram.com/subgquiz'),
  FACEBOOK_URL: fromEnv('FACEBOOK_URL', 'https://www.facebook.com/subgquiz'),
  X_URL: fromEnv('X_URL', 'https://x.com/subgquiz'),
  YOUTUBE_URL: fromEnv('YOUTUBE_URL', 'https://www.youtube.com/@subgquiz'),
  LINKEDIN_URL: fromEnv('LINKEDIN_URL', 'https://www.linkedin.com/company/subgquiz'),
  WHATSAPP_URL: fromEnv('WHATSAPP_URL', 'https://wa.me/'),
  DISCORD_URL: fromEnv('DISCORD_URL', 'https://discord.com/invite/'),
  TELEGRAM_URL: fromEnv('TELEGRAM_URL', 'https://t.me/'),
};

/**
 * Rewards configuration
 * @type {Object}
 */
export const REWARDS = {
  MONTHLY_REWARD_QUIZ_REQUIREMENT: Number(fromEnv('MONTHLY_REWARD_QUIZ_REQUIREMENT', '220')),
  MONTHLY_REWARD_PRIZE_POOL: Number(fromEnv('MONTHLY_REWARD_PRIZE_POOL', '10000')),
  LEVEL_10_QUIZ_REQUIREMENT: Number(fromEnv('LEVEL_10_QUIZ_REQUIREMENT', '220')),
};

/**
 * API URLs configuration
 * @type {string}
 */
export const LOCAL_URL = fromEnv('LOCAL_URL', 'http://10.5.50.148:5000');
export const BACKEND_URL = fromEnv('API_URL', 'https://subg-backend.onrender.com');
export const API_URL = fromEnv('API_URL', __DEV__ ? LOCAL_URL : BACKEND_URL);
