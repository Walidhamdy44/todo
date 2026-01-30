/**
 * Speech Recognition Utility Functions
 */

/**
 * Detect if text contains Arabic characters
 */
export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Detect optimal language based on text content
 */
export function detectLanguage(text: string): 'en-US' | 'ar-SA' {
  return isArabicText(text) ? 'ar-SA' : 'en-US';
}

/**
 * Get RTL attribute based on language
 */
export function getDirection(language: string): 'ltr' | 'rtl' {
  return language.startsWith('ar') ? 'rtl' : 'ltr';
}

/**
 * Get Arabic dialect variants
 */
export const ARABIC_DIALECTS = {
  'ar-SA': 'Modern Standard Arabic (Saudi)',
  'ar-EG': 'Egyptian Arabic',
  'ar-AE': 'Gulf Arabic (UAE)',
};

/**
 * Get supported languages
 */
export const SUPPORTED_LANGUAGES = {
  'en-US': 'English',
  'ar-SA': 'Arabic (Saudi)',
  'ar-EG': 'Arabic (Egyptian)',
  'ar-AE': 'Arabic (Gulf)',
};

/**
 * Format transcript for display
 */
export function formatTranscript(transcript: string, language: string): string {
  let formatted = transcript.trim();

  // Add punctuation if missing
  if (formatted && !['!', '?', '.'].includes(formatted[formatted.length - 1])) {
    formatted += '.';
  }

  return formatted;
}

/**
 * Validate if browser supports Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;

  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );
}

/**
 * Get browser-specific SpeechRecognition constructor
 */
export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;

  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );
}

/**
 * Error message translations
 */
export const ERROR_MESSAGES = {
  'no-speech': 'No speech detected. Please try again.',
  'audio-capture': 'No microphone found. Ensure it is connected.',
  'network': 'Network error. Check your internet connection.',
  'not-allowed': 'Microphone permission denied. Please enable it in your browser settings.',
  'service-not-allowed': 'Speech Recognition service is not allowed.',
  'bad-grammar': 'Speech grammar error. Please try again.',
  'network-timeout': 'Network timeout. Please try again.',
  'aborted': 'Recording stopped.',
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || `Error: ${errorCode}`;
}

/**
 * Create speech recognition configuration
 */
export function createSpeechRecognitionConfig(
  language: string = 'en-US',
  options: {
    continuous?: boolean;
    interimResults?: boolean;
    maxAlternatives?: number;
  } = {}
) {
  return {
    language,
    continuous: options.continuous ?? true,
    interimResults: options.interimResults ?? true,
    maxAlternatives: options.maxAlternatives ?? 1,
  };
}

/**
 * Debounce function for voice input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, delay);
  };
}
