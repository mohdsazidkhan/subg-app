// On-device translation service using ML Kit
import TranslateText, { TranslateLanguage } from '@react-native-ml-kit/translate-text';

// Map ISO codes to ML Kit TranslateLanguage constant names (string keys)
const CODE_TO_MLKIT_KEY = {
  en: 'ENGLISH',
  hi: 'HINDI',
  es: 'SPANISH',
  fr: 'FRENCH',
  de: 'GERMAN',
  zh: 'CHINESE',
  'zh-cn': 'CHINESE',
  'zh-hans': 'CHINESE',
  'zh-tw': 'CHINESE_TRADITIONAL',
  'zh-hant': 'CHINESE_TRADITIONAL',
  ja: 'JAPANESE',
  ko: 'KOREAN',
  pt: 'PORTUGUESE',
  'pt-br': 'PORTUGUESE',
  'pt-pt': 'PORTUGUESE',
  ru: 'RUSSIAN',
  it: 'ITALIAN',
  ar: 'ARABIC',
  bn: 'BENGALI',
  ur: 'URDU',
  ta: 'TAMIL',
  te: 'TELUGU',
  mr: 'MARATHI',
  gu: 'GUJARATI',
  pa: 'PUNJABI',
  kn: 'KANNADA',
  ml: 'MALAYALAM',
  or: 'ODIA', // Oriya
  od: 'ODIA',
  as: 'ASSAMESE',
  ne: 'NEPALI',
  si: 'SINHALA',
  th: 'THAI',
  tr: 'TURKISH',
  vi: 'VIETNAMESE',
  pl: 'POLISH',
  nl: 'DUTCH',
  cs: 'CZECH',
  el: 'GREEK',
  he: 'HEBREW',
  iw: 'HEBREW',
  hu: 'HUNGARIAN',
  id: 'INDONESIAN',
  ms: 'MALAY',
  fil: 'FILIPINO',
  tl: 'FILIPINO',
  sv: 'SWEDISH',
  no: 'NORWEGIAN',
  nb: 'NORWEGIAN',
  nn: 'NORWEGIAN',
  fi: 'FINNISH',
  bg: 'BULGARIAN',
  ro: 'ROMANIAN',
  sk: 'SLOVAK',
  lt: 'LITHUANIAN',
  lv: 'LATVIAN',
  et: 'ESTONIAN',
  sr: 'SERBIAN',
  hr: 'CROATIAN',
  sl: 'SLOVENIAN',
  bs: 'BOSNIAN',
  mk: 'MACEDONIAN',
  sq: 'ALBANIAN',
  is: 'ICELANDIC',
  mt: 'MALTESE',
  cy: 'WELSH',
  ga: 'IRISH',
  gl: 'GALICIAN',
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Oriya' },
  { code: 'as', name: 'Assamese' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'fil', name: 'Filipino' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'et', name: 'Estonian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'sq', name: 'Albanian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'mt', name: 'Maltese' },
  { code: 'cy', name: 'Welsh' },
  { code: 'ga', name: 'Irish' },
  { code: 'gl', name: 'Galician' },
];

const languageCodeToMlKit = (code) => {
  const normalized = (code || '').toLowerCase();
  const direct = CODE_TO_MLKIT_KEY[normalized];
  const base = CODE_TO_MLKIT_KEY[normalized.split('-')[0]];
  const key = direct || base;
  const constant = key && TranslateLanguage[key];
  return constant || TranslateLanguage.ENGLISH;
};

export const translateOnDevice = async (text, targetLangCode, opts = {}) => {
  if (!text || typeof text !== 'string') return text;
  try {
    const targetLanguage = languageCodeToMlKit(targetLangCode);
    const translated = await TranslateText.translate({
      text,
      sourceLanguage: TranslateLanguage.AUTO,
      targetLanguage,
      downloadModelIfNeeded: true,
      ...opts,
    });
    return translated || text;
  } catch (err) {
    // Fallback to original text on any failure
    return text;
  }
};

// Simple in-memory cache to avoid repeated translations during one session
const cache = new Map();

export const translateWithCache = async (text, targetLangCode) => {
  if (!text) return text;
  const key = `${targetLangCode}::${text}`;
  if (cache.has(key)) return cache.get(key);
  const result = await translateOnDevice(text, targetLangCode);
  cache.set(key, result);
  return result;
};


