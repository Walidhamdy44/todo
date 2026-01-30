'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle, Volume2, Zap } from 'lucide-react';
import { Modal, Button, Badge } from '@/components/ui';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseVoiceCommand, isValidParsedCommand } from '@/lib/voice-commands/parser';
import { executeCommand, ExecutionResult } from '@/lib/voice-commands/executor';

interface VoiceAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandExecuted?: (result: ExecutionResult) => void;
}

export function VoiceAssistantDialog({
  isOpen,
  onClose,
  onCommandExecuted
}: VoiceAssistantDialogProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    language
  } = useSpeechRecognition();

  const [parsedCommand, setParsedCommand] = useState<any>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(true);

  useEffect(() => {
    if (isOpen && !isListening) {
      // Auto-start listening when dialog opens
      setTimeout(() => startListening(), 500);
    }
  }, [isOpen, isListening, startListening]);

  // Parse command when transcript changes
  useEffect(() => {
    if (transcript) {
      const command = parseVoiceCommand(transcript);
      setParsedCommand(command);

      // Show examples when valid command is parsed
      if (isValidParsedCommand(command)) {
        setShowExamples(false);
      }
    }
  }, [transcript]);

  const handleExecute = async () => {
    if (!parsedCommand) return;

    setIsExecuting(true);

    try {
      const result = await executeCommand(parsedCommand);
      setExecutionResult(result);
      setCommandHistory([...commandHistory, transcript]);
      stopListening();

      if (onCommandExecuted) {
        onCommandExecuted(result);
      }

      // Auto-close after successful command
      if (result.success) {
        setTimeout(() => {
          onClose();
          setParsedCommand(null);
          setExecutionResult(null);
          setShowExamples(true);
        }, 2000);
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        message: 'Failed to execute command',
        displayType: 'error'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTryAgain = () => {
    setParsedCommand(null);
    setExecutionResult(null);
    setShowExamples(true);
    startListening();
  };

  const handleNewCommand = () => {
    setParsedCommand(null);
    setExecutionResult(null);
    setShowExamples(true);
    startListening();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voice Assistant"
      description="Speak your command or action"
      size="lg"
    >
      <div className="space-y-4">
        {/* Listening State */}
        {isListening && !parsedCommand && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
              <Mic className="w-16 h-16 text-red-500 relative z-10 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Listening...</p>
              {interimTranscript && (
                <p className="text-base font-medium mt-2 text-zinc-900 dark:text-zinc-100">
                  {interimTranscript}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Your command:</p>
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100 mt-1">
              {transcript}
            </p>
          </div>
        )}

        {/* Parsed Command Display */}
        {parsedCommand && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  {parsedCommand.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                  Confidence: {parsedCommand.confidence}%
                </p>

                {/* Parameters */}
                {Object.keys(parsedCommand.parameters).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {Object.entries(parsedCommand.parameters).map(([key, value]: [string, any]) => {
                      if (value) {
                        return (
                          <div key={key} className="text-xs">
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {key}:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 ml-1">
                              {String(value)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div
            className={`rounded-lg p-4 flex items-start gap-3 ${
              executionResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            {executionResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={
                  executionResult.success
                    ? 'text-sm font-medium text-green-900 dark:text-green-200'
                    : 'text-sm font-medium text-red-900 dark:text-red-200'
                }
              >
                {executionResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Examples */}
        {showExamples && !parsedCommand && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-3">
              Try saying things like:
            </p>
            <ul className="space-y-2 text-xs text-amber-800 dark:text-amber-300">
              <li>• "Create task Review Report due tomorrow"</li>
              <li>• "Show tasks today"</li>
              <li>• "Add course JavaScript Basics"</li>
              <li>• "Create goal Learn React by March 31"</li>
              <li>• "Mark Review Report as done"</li>
              <li>• "What's on my plate"</li>
            </ul>
          </div>
        )}

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Recent commands:
            </p>
            <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {commandHistory.slice(-3).map((cmd, idx) => (
                <li key={idx} className="truncate">
                  {idx + 1}. {cmd}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        {!executionResult ? (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                stopListening();
                onClose();
              }}
            >
              Cancel
            </Button>

            {parsedCommand && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleTryAgain}
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleExecute}
                  isLoading={isExecuting}
                  disabled={!isValidParsedCommand(parsedCommand) || isExecuting}
                >
                  Execute Command
                </Button>
              </>
            )}

            {!parsedCommand && isListening && (
              <Button onClick={stopListening}>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </Button>
            )}

            {!isListening && !parsedCommand && (
              <Button onClick={() => startListening()}>
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
            {executionResult.success && (
              <Button onClick={handleNewCommand}>
                New Command
              </Button>
            )}
            {!executionResult.success && (
              <Button onClick={handleTryAgain}>
                Try Again
              </Button>
            )}
          </>
        )}
      </div>

      {/* Info Badge */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Language: {language === 'ar-SA' ? 'العربية' : 'English'}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isListening ? 'Listening...' : 'Ready to listen'}
        </p>
      </div>
    </Modal>
  );
}
