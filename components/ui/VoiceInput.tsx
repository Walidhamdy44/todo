'use client';

import React, { useEffect } from 'react';
import { Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  language?: 'en-US' | 'ar-SA';
  onLanguageChange?: (lang: string) => void;
  append?: boolean;
  className?: string;
}

export function VoiceInput({
  value,
  onChange,
  placeholder = 'Click the microphone to start speaking...',
  language = 'en-US',
  onLanguageChange,
  append = false,
  className,
}: VoiceInputProps) {
  const {
    transcript,
    interimTranscript,
    isListening,
    hasSupport,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  } = useSpeechRecognition({
    language,
    continuous: true,
    interimResults: true,
  });

  // Update language when prop changes
  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  // Update parent input when transcript changes
  useEffect(() => {
    if (transcript) {
      const newValue = append ? value + ' ' + transcript : transcript;
      onChange(newValue.trim());
      resetTranscript();
    }
  }, [transcript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en-US' ? 'ar-SA' : 'en-US';
    setLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  if (!hasSupport) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Language Toggle Badge */}
      <button
        onClick={handleLanguageToggle}
        className={cn(
          'px-2 py-1 rounded-full text-xs font-medium transition-all duration-200',
          'border border-zinc-200 dark:border-zinc-700',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          language === 'ar-SA'
            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
        )}
        title="Toggle between English and Arabic"
      >
        {language === 'en-US' ? 'EN' : 'AR'}
      </button>

      {/* Microphone Button */}
      <button
        onClick={handleToggleListening}
        className={cn(
          'p-2 rounded-lg transition-all duration-200 flex items-center justify-center relative',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isListening
            ? 'bg-red-50 dark:bg-red-950 focus:ring-red-500'
            : 'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-400'
        )}
        title={isListening ? 'Stop listening' : 'Start listening'}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        {/* Listening Pulse Animation */}
        {isListening && (
          <div className="absolute inset-0 rounded-lg">
            <div className="absolute inset-0 rounded-lg border-2 border-red-500 animate-pulse opacity-75" />
          </div>
        )}

        {/* Microphone Icon */}
        <Mic
          size={20}
          className={cn(
            'transition-colors duration-200 relative z-10',
            isListening ? 'text-red-500' : 'text-zinc-400',
            error && 'text-red-600'
          )}
        />
      </button>

      {/* Interim Transcript Display */}
      {interimTranscript && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 italic flex-1">
          {interimTranscript}...
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 flex-1">
          {error}
        </div>
      )}

      {/* Listening Status Text */}
      {isListening && !interimTranscript && !error && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 flex-1">
          Listening...
        </div>
      )}
    </div>
  );
}
