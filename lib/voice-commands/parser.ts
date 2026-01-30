import { parseCommandWithGemini, ParsedCommand } from '@/lib/gemini/client';
import { parseWithFallback } from './fallback-parser';

export interface VoiceCommandResult {
  success: boolean;
  command?: ParsedCommand;
  source?: 'gemini' | 'pattern';
  error?: string;
  originalText: string;
}

/**
 * Parse voice command using Gemini API with fallback to pattern matching
 */
export async function parseVoiceCommand(text: string): Promise<VoiceCommandResult> {
  if (!text.trim()) {
    return {
      success: false,
      error: 'Empty command',
      originalText: text,
    };
  }

  // Try Gemini API first (if API key is available)
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('[v0] Attempting to parse with Gemini API');
      const geminiResult = await parseCommandWithGemini(text);

      if (geminiResult.success && geminiResult.command && geminiResult.command.confidence > 70) {
        console.log('[v0] Successfully parsed with Gemini:', geminiResult.command.action);
        return {
          success: true,
          command: geminiResult.command,
          source: 'gemini',
          originalText: text,
        };
      }

      if (geminiResult.success && geminiResult.command) {
        console.log('[v0] Gemini confidence too low:', geminiResult.command.confidence);
      }
    } catch (error) {
      console.log('[v0] Gemini API failed, trying fallback:', error instanceof Error ? error.message : error);
    }
  }

  // Fallback to pattern matching
  try {
    console.log('[v0] Attempting to parse with pattern matching');
    const fallbackResult = parseWithFallback(text);

    if (fallbackResult.success && fallbackResult.command) {
      console.log('[v0] Successfully parsed with pattern matching:', fallbackResult.command.action);
      return {
        success: true,
        command: fallbackResult.command,
        source: 'pattern',
        originalText: text,
      };
    }

    console.log('[v0] Pattern matching failed');
  } catch (error) {
    console.log('[v0] Pattern matching error:', error instanceof Error ? error.message : error);
  }

  // No parser succeeded
  return {
    success: false,
    error: 'Could not parse command. Please try again with a clearer command.',
    originalText: text,
  };
}
