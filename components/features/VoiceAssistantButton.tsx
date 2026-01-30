'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui';

interface VoiceAssistantButtonProps {
  onClick: () => void;
  isListening?: boolean;
}

export function VoiceAssistantButton({ onClick, isListening = false }: VoiceAssistantButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`gap-2 ${
        isListening
          ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
          : ''
      }`}
      title="Open voice assistant (keyboard shortcut: Alt+V)"
    >
      <Mic className={`w-4 h-4 ${isListening ? 'text-red-600 dark:text-red-400 animate-pulse' : ''}`} />
      <span className="hidden sm:inline">Voice</span>
    </Button>
  );
}
