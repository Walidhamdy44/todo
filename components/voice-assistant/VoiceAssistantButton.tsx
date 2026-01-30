'use client';

import React, { useState, useCallback } from 'react';
import { Mic, Loader2, AlertCircle, X } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseVoiceCommand } from '@/lib/voice-commands/parser';
import { executeCommand } from '@/lib/voice-commands/executor';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface VoiceAssistantButtonProps {
  onCommandExecuted?: (result: any) => void;
  className?: string;
}

export function VoiceAssistantButton({ onCommandExecuted, className }: VoiceAssistantButtonProps) {
  const { transcript, isListening, hasSupport, error, startListening, stopListening, resetTranscript } =
    useSpeechRecognition({
      language: 'en-US',
      continuous: true,
      interimResults: true,
    });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [commandResult, setCommandResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setCommandResult(null);
      setParseError(null);
      resetTranscript();
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript]);

  // Process transcript when listening stops
  React.useEffect(() => {
    if (!isListening && transcript && !isProcessing) {
      const processCommand = async () => {
        try {
          setIsProcessing(true);
          setParseError(null);
          setShowResults(true);

          console.log('[v0] Processing voice command:', transcript);

          // Parse the command
          const parseResult = await parseVoiceCommand(transcript);

          if (!parseResult.success) {
            setParseError(parseResult.error || 'Failed to parse command');
            setCommandResult(null);
            return;
          }

          console.log('[v0] Command parsed successfully:', parseResult.command);

          // Execute the command
          const executionResult = await executeCommand(parseResult.command!);

          console.log('[v0] Command executed:', executionResult);

          setCommandResult(executionResult);
          onCommandExecuted?.(executionResult);
        } catch (err) {
          console.error('[v0] Error processing command:', err);
          setParseError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setIsProcessing(false);
        }
      };

      processCommand();
    }
  }, [isListening, transcript, isProcessing, onCommandExecuted]);

  if (!hasSupport) {
    return null;
  }

  return (
    <>
      {/* Voice Assistant Button */}
      <button
        onClick={handleToggleListening}
        disabled={isProcessing}
        className={cn(
          'relative p-3 rounded-full transition-all duration-200 flex items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isListening || isProcessing
            ? 'bg-red-50 dark:bg-red-950 focus:ring-red-500'
            : 'bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 focus:ring-blue-500',
          isProcessing && 'opacity-75 cursor-not-allowed',
          className
        )}
        title={
          isProcessing ? 'Processing...' : isListening ? 'Stop listening' : 'Click to start voice assistant'
        }
        aria-label="Voice assistant button"
      >
        {/* Listening Pulse Animation */}
        {isListening && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse opacity-75" />
          </div>
        )}

        {/* Icon */}
        {isProcessing ? (
          <Loader2 size={24} className="text-blue-600 dark:text-blue-400 relative z-10 animate-spin" />
        ) : (
          <Mic
            size={24}
            className={cn(
              'transition-colors duration-200 relative z-10',
              isListening ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400',
              error && 'text-red-700'
            )}
          />
        )}
      </button>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full animate-in fade-in zoom-in-95">
            <CardHeader className="flex items-center justify-between pb-3">
              <CardTitle className="text-lg">
                {parseError ? 'Command Error' : commandResult?.success ? 'Success' : 'Processing'}
              </CardTitle>
              <button
                onClick={() => {
                  setShowResults(false);
                  resetTranscript();
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Display Transcript */}
              {transcript && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">You said:</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 italic">"{transcript}"</p>
                </div>
              )}

              {/* Display Error */}
              {parseError && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{parseError}</p>
                </div>
              )}

              {/* Display Command Result */}
              {commandResult && !parseError && (
                <div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      {commandResult.message}
                    </p>
                  </div>

                  {/* Display Data Preview */}
                  {commandResult.data && Array.isArray(commandResult.data) && commandResult.data.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">Results:</p>
                      <div className="space-y-2">
                        {commandResult.data.slice(0, 3).map((item: any, index: number) => (
                          <div
                            key={index}
                            className="text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                          >
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {item.title || item.name || 'Item'}
                            </p>
                            {item.priority && (
                              <p className="text-zinc-600 dark:text-zinc-400">Priority: {item.priority}</p>
                            )}
                          </div>
                        ))}
                        {commandResult.data.length > 3 && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            +{commandResult.data.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResults(false);
                    resetTranscript();
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResults(false);
                    resetTranscript();
                    setTimeout(() => handleToggleListening(), 100);
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
