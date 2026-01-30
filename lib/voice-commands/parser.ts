import { COMMAND_PATTERNS, sortPatternsBySpecificity, CommandPattern } from './patterns';
import { parseNaturalDate, formatDateForAPI } from './date-parser';

export interface ParsedCommand {
  action: string;
  entity: string;
  parameters: {
    title?: string;
    deadline?: string;
    priority?: 'high' | 'medium' | 'low';
    description?: string;
    url?: string;
    status?: string;
    filter?: string;
    timeframe?: string;
    targetDate?: string;
    videoNumber?: number;
    courseName?: string;
    progress?: number;
    [key: string]: any;
  };
  confidence: number;
  originalText: string;
  pattern?: CommandPattern;
}

export function parseVoiceCommand(text: string): ParsedCommand | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const normalized = normalizeText(text);
  
  // Sort patterns by specificity (more specific patterns first)
  const sortedPatterns = sortPatternsBySpecificity(COMMAND_PATTERNS);

  for (const pattern of sortedPatterns) {
    const match = normalized.match(pattern.regex);

    if (match) {
      try {
        const parameters = extractParameters(match, pattern, normalized);

        // Validate command
        if (!isValidCommand(pattern.action, parameters)) {
          continue;
        }

        return {
          action: pattern.action,
          entity: pattern.entity,
          parameters,
          confidence: calculateConfidence(pattern, match, normalized),
          originalText: text,
          pattern
        };
      } catch (error) {
        console.error('Error parsing command:', error);
        continue;
      }
    }
  }

  return null;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Common speech-to-text corrections
    .replace(/\btusk\b/g, 'task')
    .replace(/\bask\b/g, 'ask')
    .replace(/\bfor/g, 'for')
    .replace(/\band\b/g, 'and')
    .replace(/\bcorce\b/g, 'course')
    .replace(/\bgovel\b/g, 'goal')
    .replace(/\breeding\b/g, 'reading')
    .replace(/\bmarkt\b/g, 'mark')
    .replace(/\bdelet\b/g, 'delete')
    .replace(/\bremov\b/g, 'remove');
}

function extractParameters(match: RegExpMatchArray, pattern: CommandPattern, originalText: string): ParsedCommand['parameters'] {
  const parameters: ParsedCommand['parameters'] = {};
  const extractFields = pattern.extract;

  for (let i = 0; i < extractFields.length; i++) {
    const field = extractFields[i];
    const value = match[i + 1];

    if (!value) continue;

    const trimmedValue = value.trim();

    switch (field) {
      case 'title':
        parameters.title = trimmedValue;
        break;
      case 'deadline':
        const parsedDate = parseNaturalDate(trimmedValue);
        if (parsedDate) {
          parameters.deadline = formatDateForAPI(parsedDate);
        }
        break;
      case 'priority':
        if (['high', 'medium', 'low'].includes(trimmedValue.toLowerCase())) {
          parameters.priority = trimmedValue.toLowerCase() as 'high' | 'medium' | 'low';
        }
        break;
      case 'description':
        parameters.description = trimmedValue;
        break;
      case 'url':
        if (isValidURL(trimmedValue)) {
          parameters.url = trimmedValue;
        }
        break;
      case 'filter':
        parameters.filter = trimmedValue;
        break;
      case 'timeframe':
        parameters.timeframe = trimmedValue;
        break;
      case 'targetDate':
        const targetDate = parseNaturalDate(trimmedValue);
        if (targetDate) {
          parameters.targetDate = formatDateForAPI(targetDate);
        }
        break;
      case 'videoNumber':
        parameters.videoNumber = parseInt(trimmedValue);
        break;
      case 'courseName':
        parameters.courseName = trimmedValue;
        break;
      case 'progress':
        parameters.progress = parseInt(trimmedValue);
        break;
      default:
        parameters[field] = trimmedValue;
    }
  }

  // Auto-detect priority if not explicit
  if (!parameters.priority && shouldHavePriority(pattern.action)) {
    parameters.priority = detectPriority(originalText);
  }

  return parameters;
}

function detectPriority(text: string): 'high' | 'medium' | 'low' {
  if (/\b(urgent|important|critical|asap|immediately|high|priority)\b/i.test(text)) {
    return 'high';
  }
  if (/\b(low|minor|later|whenever)\b/i.test(text)) {
    return 'low';
  }
  return 'medium';
}

function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidCommand(action: string, parameters: ParsedCommand['parameters']): boolean {
  switch (action) {
    case 'create_task':
      return !!parameters.title;
    case 'create_course':
      return !!parameters.name || !!parameters.title;
    case 'create_reading':
      return !!parameters.title || !!parameters.url;
    case 'create_goal':
      return !!parameters.title;
    case 'mark_task_done':
    case 'delete_task':
    case 'mark_reading_read':
      return !!parameters.title;
    case 'update_task_priority':
      return !!parameters.title && !!parameters.priority;
    case 'update_goal_progress':
      return !!parameters.title && parameters.progress !== undefined;
    case 'mark_video_watched':
      return parameters.videoNumber !== undefined && !!parameters.courseName;
    default:
      return true;
  }
}

function shouldHavePriority(action: string): boolean {
  return ['create_task', 'create_reading'].includes(action);
}

function calculateConfidence(pattern: CommandPattern, match: RegExpMatchArray, text: string): number {
  let confidence = 85;

  // More specific patterns (more capture groups) = higher confidence
  const captureGroups = (pattern.regex.source.match(/\(/g) || []).length;
  confidence += Math.min(captureGroups * 2, 10);

  // Exact matches in examples boost confidence
  if (pattern.examples.some(ex => 
    normalizeText(ex) === text || 
    normalizeText(ex).includes(text.substring(0, 20))
  )) {
    confidence = Math.min(confidence + 5, 100);
  }

  return Math.min(confidence, 100);
}

export function isValidParsedCommand(command: ParsedCommand | null): command is ParsedCommand {
  return command !== null && command.confidence >= 50;
}
