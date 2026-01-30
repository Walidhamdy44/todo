'use client';

import React, { forwardRef, useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { VoiceInput } from '@/components/ui/VoiceInput';
import { cn } from '@/lib/utils';

interface VoiceEnabledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
  voiceEnabled?: boolean;
  language?: 'en-US' | 'ar-SA';
  onLanguageChange?: (lang: string) => void;
}

export const VoiceEnabledInput = forwardRef<HTMLInputElement, VoiceEnabledInputProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      helperText,
      voiceEnabled = true,
      language = 'en-US',
      onLanguageChange,
      className,
      ...props
    },
    ref
  ) => {
    const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'ar-SA'>(language);

    const handleLanguageChange = (lang: string) => {
      setCurrentLanguage(lang as 'en-US' | 'ar-SA');
      onLanguageChange?.(lang);
    };

    const handleVoiceChange = (text: string) => {
      onChange?.({
        target: { value: text },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative',
            currentLanguage === 'ar-SA' && 'dir-rtl'
          )}
          dir={currentLanguage === 'ar-SA' ? 'rtl' : 'ltr'}
        >
          <Input
            ref={ref}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            className={cn(
              'pr-12',
              currentLanguage === 'ar-SA' && 'text-right',
              className
            )}
            lang={currentLanguage}
            {...props}
          />
          {voiceEnabled && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <VoiceInput
                value={value as string}
                onChange={handleVoiceChange}
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                className="flex-row-reverse"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

VoiceEnabledInput.displayName = 'VoiceEnabledInput';

interface VoiceEnabledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
  voiceEnabled?: boolean;
  language?: 'en-US' | 'ar-SA';
  onLanguageChange?: (lang: string) => void;
}

export const VoiceEnabledTextarea = forwardRef<HTMLTextAreaElement, VoiceEnabledTextareaProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      helperText,
      voiceEnabled = true,
      language = 'en-US',
      onLanguageChange,
      className,
      ...props
    },
    ref
  ) => {
    const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'ar-SA'>(language);

    const handleLanguageChange = (lang: string) => {
      setCurrentLanguage(lang as 'en-US' | 'ar-SA');
      onLanguageChange?.(lang);
    };

    const handleVoiceChange = (text: string) => {
      onChange?.({
        target: { value: text },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative',
            currentLanguage === 'ar-SA' && 'dir-rtl'
          )}
          dir={currentLanguage === 'ar-SA' ? 'rtl' : 'ltr'}
        >
          <Textarea
            ref={ref}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            className={cn(
              'pr-12',
              currentLanguage === 'ar-SA' && 'text-right',
              className
            )}
            lang={currentLanguage}
            {...props}
          />
          {voiceEnabled && (
            <div className="absolute right-3 top-4">
              <VoiceInput
                value={value as string}
                onChange={handleVoiceChange}
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                className="flex-row-reverse"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

VoiceEnabledTextarea.displayName = 'VoiceEnabledTextarea';
