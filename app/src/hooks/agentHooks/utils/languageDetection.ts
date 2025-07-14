'use client';

/**
 * Language Detection Utility using ELD (Efficient Language Detector)
 * Detects the language of dream text to optimize AI responses
 */

import { eld } from 'eld';

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isReliable: boolean;
  allScores: Record<string, number>;
}

export interface LanguageMapping {
  [key: string]: {
    name: string;
    responseLanguage: string;
    promptInstruction: string;
  };
}

/**
 * Mapowanie kodu ISO 639-1 na instrukcje dla AI
 */
const LANGUAGE_MAPPINGS: LanguageMapping = {
  'en': {
    name: 'English',
    responseLanguage: 'English',
    promptInstruction: 'Respond in English'
  },
  'pl': {
    name: 'Polish',
    responseLanguage: 'Polish',
    promptInstruction: 'Odpowiadaj w języku polskim'
  },
  'es': {
    name: 'Spanish',
    responseLanguage: 'Spanish',
    promptInstruction: 'Responde en español'
  },
  'fr': {
    name: 'French',
    responseLanguage: 'French',
    promptInstruction: 'Répondez en français'
  },
  'de': {
    name: 'German',
    responseLanguage: 'German',
    promptInstruction: 'Antworten Sie auf Deutsch'
  },
  'it': {
    name: 'Italian',
    responseLanguage: 'Italian',
    promptInstruction: 'Rispondi in italiano'
  },
  'pt': {
    name: 'Portuguese',
    responseLanguage: 'Portuguese',
    promptInstruction: 'Responda em português'
  },
  'ru': {
    name: 'Russian',
    responseLanguage: 'Russian',
    promptInstruction: 'Отвечайте на русском языке'
  },
  'nl': {
    name: 'Dutch',
    responseLanguage: 'Dutch',
    promptInstruction: 'Reageer in het Nederlands'
  },
  'sv': {
    name: 'Swedish',
    responseLanguage: 'Swedish',
    promptInstruction: 'Svara på svenska'
  },
  'da': {
    name: 'Danish',
    responseLanguage: 'Danish',
    promptInstruction: 'Svar på dansk'
  },
  'no': {
    name: 'Norwegian',
    responseLanguage: 'Norwegian',
    promptInstruction: 'Svar på norsk'
  },
  'fi': {
    name: 'Finnish',
    responseLanguage: 'Finnish',
    promptInstruction: 'Vastaa suomeksi'
  },
  'cs': {
    name: 'Czech',
    responseLanguage: 'Czech',
    promptInstruction: 'Odpovídejte česky'
  },
  'sk': {
    name: 'Slovak',
    responseLanguage: 'Slovak',
    promptInstruction: 'Odpovedajte v slovenčine'
  },
  'hu': {
    name: 'Hungarian',
    responseLanguage: 'Hungarian',
    promptInstruction: 'Válaszoljon magyarul'
  },
  'ro': {
    name: 'Romanian',
    responseLanguage: 'Romanian',
    promptInstruction: 'Răspundeți în română'
  },
  'bg': {
    name: 'Bulgarian',
    responseLanguage: 'Bulgarian',
    promptInstruction: 'Отговорете на български'
  },
  'hr': {
    name: 'Croatian',
    responseLanguage: 'Croatian',
    promptInstruction: 'Odgovorite na hrvatskom'
  },
  'sl': {
    name: 'Slovenian',
    responseLanguage: 'Slovenian',
    promptInstruction: 'Odgovorite v slovenščini'
  },
  'et': {
    name: 'Estonian',
    responseLanguage: 'Estonian',
    promptInstruction: 'Vastake eesti keeles'
  },
  'lv': {
    name: 'Latvian',
    responseLanguage: 'Latvian',
    promptInstruction: 'Atbildiet latviešu valodā'
  },
  'lt': {
    name: 'Lithuanian',
    responseLanguage: 'Lithuanian',
    promptInstruction: 'Atsakykite lietuviškai'
  },
  'uk': {
    name: 'Ukrainian',
    responseLanguage: 'Ukrainian',
    promptInstruction: 'Відповідайте українською'
  },
  'be': {
    name: 'Belarusian',
    responseLanguage: 'Belarusian',
    promptInstruction: 'Адказвайце па-беларуску'
  },
  'ja': {
    name: 'Japanese',
    responseLanguage: 'Japanese',
    promptInstruction: '日本語で回答してください'
  },
  'ko': {
    name: 'Korean',
    responseLanguage: 'Korean',
    promptInstruction: '한국어로 답변해주세요'
  },
  'zh': {
    name: 'Chinese',
    responseLanguage: 'Chinese',
    promptInstruction: '请用中文回答'
  },
  'ar': {
    name: 'Arabic',
    responseLanguage: 'Arabic',
    promptInstruction: 'أجب باللغة العربية'
  },
  'he': {
    name: 'Hebrew',
    responseLanguage: 'Hebrew',
    promptInstruction: 'ענה בעברית'
  },
  'hi': {
    name: 'Hindi',
    responseLanguage: 'Hindi',
    promptInstruction: 'हिंदी में जवाब दें'
  },
  'th': {
    name: 'Thai',
    responseLanguage: 'Thai',
    promptInstruction: 'ตอบเป็นภาษาไทย'
  },
  'vi': {
    name: 'Vietnamese',
    responseLanguage: 'Vietnamese',
    promptInstruction: 'Trả lời bằng tiếng Việt'
  },
  'tr': {
    name: 'Turkish',
    responseLanguage: 'Turkish',
    promptInstruction: 'Türkçe cevap verin'
  },
  'fa': {
    name: 'Persian',
    responseLanguage: 'Persian',
    promptInstruction: 'به فارسی پاسخ دهید'
  },
  'ur': {
    name: 'Urdu',
    responseLanguage: 'Urdu',
    promptInstruction: 'اردو میں جواب دیں'
  },
  'bn': {
    name: 'Bengali',
    responseLanguage: 'Bengali',
    promptInstruction: 'বাংলায় উত্তর দিন'
  },
  'ta': {
    name: 'Tamil',
    responseLanguage: 'Tamil',
    promptInstruction: 'தமிழில் பதில் சொல்லுங்கள்'
  },
  'te': {
    name: 'Telugu',
    responseLanguage: 'Telugu',
    promptInstruction: 'తెలుగులో సమాధానం ఇవ్వండి'
  },
  'ml': {
    name: 'Malayalam',
    responseLanguage: 'Malayalam',
    promptInstruction: 'മലയാളത്തിൽ ഉത്തരം നൽകുക'
  },
  'kn': {
    name: 'Kannada',
    responseLanguage: 'Kannada',
    promptInstruction: 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ'
  },
  'gu': {
    name: 'Gujarati',
    responseLanguage: 'Gujarati',
    promptInstruction: 'ગુજરાતીમાં જવાબ આપો'
  },
  'mr': {
    name: 'Marathi',
    responseLanguage: 'Marathi',
    promptInstruction: 'मराठीत उत्तर द्या'
  },
  'pa': {
    name: 'Punjabi',
    responseLanguage: 'Punjabi',
    promptInstruction: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ'
  },
  'or': {
    name: 'Odia',
    responseLanguage: 'Odia',
    promptInstruction: 'ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ'
  },
  'am': {
    name: 'Amharic',
    responseLanguage: 'Amharic',
    promptInstruction: 'በአማርኛ ይመልሱ'
  },
  'yo': {
    name: 'Yoruba',
    responseLanguage: 'Yoruba',
    promptInstruction: 'Dahun ni Yoruba'
  },
  'ms': {
    name: 'Malay',
    responseLanguage: 'Malay',
    promptInstruction: 'Jawab dalam bahasa Melayu'
  },
  'tl': {
    name: 'Tagalog',
    responseLanguage: 'Tagalog',
    promptInstruction: 'Sumagot sa Tagalog'
  },
  'lo': {
    name: 'Lao',
    responseLanguage: 'Lao',
    promptInstruction: 'ຕອບເປັນພາສາລາວ'
  },
  'ka': {
    name: 'Georgian',
    responseLanguage: 'Georgian',
    promptInstruction: 'ქართულად უპასუხეთ'
  },
  'hy': {
    name: 'Armenian',
    responseLanguage: 'Armenian',
    promptInstruction: 'Պատասխանեք հայերեն'
  },
  'az': {
    name: 'Azerbaijani',
    responseLanguage: 'Azerbaijani',
    promptInstruction: 'Azərbaycan dilində cavab verin'
  },
  'kk': {
    name: 'Kazakh',
    responseLanguage: 'Kazakh',
    promptInstruction: 'Қазақша жауап беріңіз'
  },
  'ku': {
    name: 'Kurdish',
    responseLanguage: 'Kurdish',
    promptInstruction: 'Bi kurdî bersiv bidin'
  },
  'is': {
    name: 'Icelandic',
    responseLanguage: 'Icelandic',
    promptInstruction: 'Svaraðu á íslensku'
  },
  'eu': {
    name: 'Basque',
    responseLanguage: 'Basque',
    promptInstruction: 'Erantzun euskeraz'
  },
  'ca': {
    name: 'Catalan',
    responseLanguage: 'Catalan',
    promptInstruction: 'Respon en català'
  },
  'el': {
    name: 'Greek',
    responseLanguage: 'Greek',
    promptInstruction: 'Απαντήστε στα ελληνικά'
  },
  'sr': {
    name: 'Serbian',
    responseLanguage: 'Serbian',
    promptInstruction: 'Одговорите на српском'
  },
  'mk': {
    name: 'Macedonian',
    responseLanguage: 'Macedonian',
    promptInstruction: 'Одговорете на македонски'
  },
  'sq': {
    name: 'Albanian',
    responseLanguage: 'Albanian',
    promptInstruction: 'Përgjigjuni në shqip'
  }
};

/**
 * Debug logs dla development
 */
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[LanguageDetection] ${message}`, data || '');
  }
};

/**
 * Wykrywa język tekstu za pomocą ELD
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  debugLog('Starting language detection for text', { 
    length: text.length,
    preview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
  });

  try {
    // Sanitize text - usuń nadmiarowe spacje i znaki specjalne
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (cleanText.length === 0) {
      debugLog('Empty text, defaulting to English');
      return {
        language: 'en',
        confidence: 0,
        isReliable: false,
        allScores: {}
      };
    }

    // Wykrywanie języka za pomocą ELD
    const result = eld.detect(cleanText);
    const scores = result.getScores();
    const isReliable = result.isReliable();
    const detectedLanguage = result.language;
    
    debugLog('Language detection completed', {
      detectedLanguage,
      isReliable,
      confidence: scores[detectedLanguage] || 0,
      topScores: Object.entries(scores).slice(0, 3)
    });

    // Fallback do angielskiego jeśli detekcja nie jest niezawodna
    let finalLanguage = detectedLanguage;
    let finalConfidence = scores[detectedLanguage] || 0;

    if (!isReliable || finalConfidence < 0.3) {
      debugLog('Detection not reliable, falling back to English');
      finalLanguage = 'en';
      finalConfidence = 0.5; // Średnia pewność dla fallback
    }

    return {
      language: finalLanguage,
      confidence: finalConfidence,
      isReliable,
      allScores: scores
    };

  } catch (error) {
    debugLog('Error in language detection', error);
    
    // Fallback do angielskiego w przypadku błędu
    return {
      language: 'en',
      confidence: 0,
      isReliable: false,
      allScores: {}
    };
  }
}

/**
 * Zwraca instrukcje dla AI na podstawie wykrytego języka
 */
export function getLanguageInstructions(language: string): string {
  const mapping = LANGUAGE_MAPPINGS[language];
  
  if (!mapping) {
    debugLog(`Unknown language: ${language}, defaulting to English`);
    return LANGUAGE_MAPPINGS.en.promptInstruction;
  }

  debugLog(`Language instruction for ${language}`, mapping.promptInstruction);
  return mapping.promptInstruction;
}

/**
 * Zwraca pełną nazwę języka
 */
export function getLanguageName(language: string): string {
  const mapping = LANGUAGE_MAPPINGS[language];
  return mapping?.name || 'Unknown';
}

/**
 * Sprawdza czy język jest obsługiwany
 */
export function isLanguageSupported(language: string): boolean {
  return language in LANGUAGE_MAPPINGS;
}

/**
 * Zwraca wszystkie obsługiwane języki
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_MAPPINGS);
}

/**
 * Formatuje wynik detekcji dla UI
 */
export function formatDetectionResult(result: LanguageDetectionResult): string {
  const languageName = getLanguageName(result.language);
  const confidence = Math.round(result.confidence * 100);
  const reliability = result.isReliable ? '✅' : '⚠️';
  
  return `${reliability} ${languageName} (${confidence}%)`;
}

/**
 * Wykrywa język i zwraca gotowe instrukcje do promptu
 */
export function detectAndGetInstructions(text: string): {
  language: string;
  instructions: string;
  detection: LanguageDetectionResult;
} {
  const detection = detectLanguage(text);
  const instructions = getLanguageInstructions(detection.language);
  
  debugLog('Language detection and instructions ready', {
    language: detection.language,
    instructions,
    isReliable: detection.isReliable
  });

  return {
    language: detection.language,
    instructions,
    detection
  };
} 