/**
 * Language Detection Utilities
 * Wykrywa język wiadomości użytkownika przy użyciu biblioteki franc
 */

import { franc } from 'franc';

/**
 * Mapa kodów ISO 639-1 na nazwy języków
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'pl': 'Polish',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'ro': 'Romanian',
  'el': 'Greek',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'ca': 'Catalan',
  'eu': 'Basque',
  'ga': 'Irish',
  'cy': 'Welsh',
  'mt': 'Maltese',
  'is': 'Icelandic',
  'fo': 'Faroese',
  'gl': 'Galician',
  'af': 'Afrikaans',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'xh': 'Xhosa',
  'und': 'Unknown'
};

/**
 * Języki obsługiwane przez aplikację (priorytetowe)
 */
export const SUPPORTED_LANGUAGES = [
  'en', 'pl', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar'
];

/**
 * Domyślny język aplikacji
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Minimalny próg pewności dla wykrywania języka
 * Poniżej tego progu będzie używany język domyślny
 */
export const MIN_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Interfejs wyniku wykrywania języka
 */
export interface LanguageDetectionResult {
  /** Kod języka ISO 639-1 */
  language: string;
  /** Nazwa języka */
  languageName: string;
  /** Pewność wykrycia (0-1) */
  confidence: number;
  /** Czy język jest obsługiwany przez aplikację */
  isSupported: boolean;
  /** Czy użyto fallback na język domyślny */
  usedFallback: boolean;
  /** Oryginalny tekst który był analizowany */
  originalText: string;
}

/**
 * Wykrywa język tekstu używając biblioteki franc
 * 
 * @param text - Tekst do analizy
 * @param options - Opcje wykrywania
 * @returns Wynik wykrywania języka
 */
export function detectLanguage(
  text: string,
  options: {
    minLength?: number;
    fallbackLanguage?: string;
    confidenceThreshold?: number;
  } = {}
): LanguageDetectionResult {
  const {
    minLength = 10,
    fallbackLanguage = DEFAULT_LANGUAGE,
    confidenceThreshold = MIN_CONFIDENCE_THRESHOLD
  } = options;

  // Walidacja wejściowa
  if (!text || typeof text !== 'string') {
    return createFallbackResult(text, fallbackLanguage, 'Empty or invalid text');
  }

  // Oczyszczenie tekstu
  const cleanText = text.trim();
  
  if (cleanText.length < minLength) {
    return createFallbackResult(text, fallbackLanguage, 'Text too short');
  }

  try {
    // Wykrycie języka z opcjami
    const detectedLanguage = franc(cleanText, {
      minLength: minLength,
      whitelist: SUPPORTED_LANGUAGES.concat(['und']),
      // Zwiększa dokładność dla krótkich tekstów
      only: SUPPORTED_LANGUAGES
    });

    // Jeśli język nie został wykryty lub jest nieznany
    if (!detectedLanguage || detectedLanguage === 'und') {
      return createFallbackResult(text, fallbackLanguage, 'Language not detected');
    }

    // Konwersja z kodu ISO 639-3 na ISO 639-1 (franc zwraca ISO 639-3)
    const normalizedLanguage = normalizeLanguageCode(detectedLanguage);
    
    // Sprawdzenie czy język jest obsługiwany
    const isSupported = SUPPORTED_LANGUAGES.includes(normalizedLanguage);
    const finalLanguage = isSupported ? normalizedLanguage : fallbackLanguage;
    
    // Szacowanie pewności (franc nie zwraca confidence, więc używamy heurystyki)
    const confidence = estimateConfidence(cleanText, finalLanguage);
    
    // Jeśli pewność jest za niska, użyj fallback
    if (confidence < confidenceThreshold) {
      return createFallbackResult(text, fallbackLanguage, 'Low confidence');
    }

    return {
      language: finalLanguage,
      languageName: LANGUAGE_NAMES[finalLanguage] || finalLanguage,
      confidence,
      isSupported,
      usedFallback: !isSupported,
      originalText: text
    };

  } catch (error) {
    console.warn('Language detection error:', error);
    return createFallbackResult(text, fallbackLanguage, 'Detection error');
  }
}

/**
 * Normalizuje kod języka z ISO 639-3 na ISO 639-1
 */
function normalizeLanguageCode(language: string): string {
  // Mapa najczęstszych kodów ISO 639-3 na ISO 639-1
  const codeMap: Record<string, string> = {
    'eng': 'en',
    'pol': 'pl',
    'spa': 'es',
    'fra': 'fr',
    'deu': 'de',
    'ita': 'it',
    'por': 'pt',
    'rus': 'ru',
    'jpn': 'ja',
    'kor': 'ko',
    'cmn': 'zh', // Mandarin Chinese
    'zho': 'zh', // Chinese
    'ara': 'ar',
    'hin': 'hi',
    'nld': 'nl',
    'swe': 'sv',
    'dan': 'da',
    'nor': 'no',
    'fin': 'fi',
    'ces': 'cs',
    'hun': 'hu',
    'tur': 'tr',
    'ukr': 'uk'
  };

  return codeMap[language] || language;
}

/**
 * Szacuje pewność wykrywania języka na podstawie heurystyk
 */
function estimateConfidence(text: string, language: string): number {
  let confidence = 0.8; // Bazowa pewność

  // Długość tekstu - dłuższe teksty = wyższa pewność
  if (text.length > 100) confidence += 0.1;
  if (text.length > 300) confidence += 0.05;

  // Obecność charakterystycznych znaków dla języka
  if (language === 'pl' && /[ąćęłńóśźż]/i.test(text)) confidence += 0.1;
  if (language === 'es' && /[ñáéíóúü]/i.test(text)) confidence += 0.1;
  if (language === 'fr' && /[àâäéèêëïîôöùûüÿ]/i.test(text)) confidence += 0.1;
  if (language === 'de' && /[äöüß]/i.test(text)) confidence += 0.1;
  if (language === 'zh' && /[\u4e00-\u9fff]/i.test(text)) confidence += 0.15;
  if (language === 'ja' && /[\u3040-\u309f\u30a0-\u30ff]/i.test(text)) confidence += 0.15;
  if (language === 'ko' && /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/i.test(text)) confidence += 0.15;
  if (language === 'ar' && /[\u0600-\u06ff]/i.test(text)) confidence += 0.15;
  if (language === 'ru' && /[а-яё]/i.test(text)) confidence += 0.1;

  // Obecność typowych słów
  const commonWords = getCommonWords(language);
  const textLower = text.toLowerCase();
  const foundWords = commonWords.filter(word => textLower.includes(word)).length;
  if (foundWords > 0) confidence += Math.min(foundWords * 0.02, 0.1);

  return Math.min(confidence, 1.0);
}

/**
 * Zwraca typowe słowa dla danego języka
 */
function getCommonWords(language: string): string[] {
  const commonWords: Record<string, string[]> = {
    'en': ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they'],
    'pl': ['i', 'w', 'na', 'z', 'to', 'się', 'nie', 'że', 'do', 'jest'],
    'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
    'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
    'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
    'it': ['il', 'di', 'che', 'e', 'la', 'per', 'una', 'in', 'con', 'da'],
    'pt': ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para'],
    'ru': ['в', 'и', 'не', 'на', 'я', 'быть', 'то', 'он', 'с', 'а'],
    'zh': ['的', '是', '了', '在', '我', '有', '和', '就', '不', '人'],
    'ja': ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
    'ko': ['이', '그', '에', '의', '는', '을', '을', '과', '도', '로'],
    'ar': ['في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'أن']
  };

  return commonWords[language] || [];
}

/**
 * Tworzy wynik fallback gdy wykrywanie nie powiodło się
 */
function createFallbackResult(
  text: string, 
  fallbackLanguage: string, 
  reason: string
): LanguageDetectionResult {
  return {
    language: fallbackLanguage,
    languageName: LANGUAGE_NAMES[fallbackLanguage] || fallbackLanguage,
    confidence: 0.5, // Niska pewność przy fallback
    isSupported: SUPPORTED_LANGUAGES.includes(fallbackLanguage),
    usedFallback: true,
    originalText: text
  };
}

/**
 * Funkcja pomocnicza do logowania debug
 */
export function logLanguageDetection(
  result: LanguageDetectionResult,
  debugLog: (message: string, data?: any) => void
) {
  debugLog('🌍 Language Detection Result', {
    detectedLanguage: result.language,
    languageName: result.languageName,
    confidence: result.confidence,
    isSupported: result.isSupported,
    usedFallback: result.usedFallback,
    textLength: result.originalText.length,
    textPreview: result.originalText.substring(0, 50) + (result.originalText.length > 50 ? '...' : '')
  });
}

/**
 * Zwraca instrukcję dla AI w odpowiednim języku
 */
export function getLanguageInstruction(language: string): string {
  const instructions: Record<string, string> = {
    'en': 'Please respond in English.',
    'pl': 'Please respond in Polish (Polski).',
    'es': 'Please respond in Spanish (Español).',
    'fr': 'Please respond in French (Français).',
    'de': 'Please respond in German (Deutsch).',
    'it': 'Please respond in Italian (Italiano).',
    'pt': 'Please respond in Portuguese (Português).',
    'ru': 'Please respond in Russian (Русский).',
    'ja': 'Please respond in Japanese (日本語).',
    'ko': 'Please respond in Korean (한국어).',
    'zh': 'Please respond in Chinese (中文).',
    'ar': 'Please respond in Arabic (العربية).',
    'hi': 'Please respond in Hindi (हिंदी).',
    'nl': 'Please respond in Dutch (Nederlands).',
    'sv': 'Please respond in Swedish (Svenska).',
    'da': 'Please respond in Danish (Dansk).',
    'no': 'Please respond in Norwegian (Norsk).',
    'fi': 'Please respond in Finnish (Suomi).',
    'cs': 'Please respond in Czech (Čeština).',
    'hu': 'Please respond in Hungarian (Magyar).',
    'tr': 'Please respond in Turkish (Türkçe).',
    'uk': 'Please respond in Ukrainian (Українська).'
  };

  return instructions[language] || instructions[DEFAULT_LANGUAGE];
} 