import { ParsedCommand } from '@/lib/gemini/client';

interface PatternRule {
  regex: RegExp;
  action: string;
  entity: string;
  extract: (match: RegExpMatchArray) => Record<string, any>;
}

function parseDate(dateText: string): string | null {
  const text = dateText.toLowerCase();
  const today = new Date();

  if (text.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (text.includes('today')) {
    return today.toISOString().split('T')[0];
  }

  if (text.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  // Try to parse month/day patterns like "Feb 24"
  const monthDayMatch = dateText.match(/(\w+)\s+(\d{1,2})/i);
  if (monthDayMatch) {
    const [, month, day] = monthDayMatch;
    const monthIndex = new Date(`${month} 1`).getMonth();
    if (monthIndex !== -1) {
      const date = new Date(today.getFullYear(), monthIndex, parseInt(day));
      // If the date is in the past, assume next year
      if (date < today) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return date.toISOString().split('T')[0];
    }
  }

  return null;
}

function extractPriority(text: string): 'high' | 'medium' | 'low' {
  const highKeywords = ['urgent', 'important', 'critical', 'asap', 'high priority'];
  const lowKeywords = ['low priority', 'whenever', 'later'];

  const lowerText = text.toLowerCase();

  for (const keyword of highKeywords) {
    if (lowerText.includes(keyword)) return 'high';
  }

  for (const keyword of lowKeywords) {
    if (lowerText.includes(keyword)) return 'low';
  }

  return 'medium';
}

const FALLBACK_PATTERNS: PatternRule[] = [
  // Create task with deadline and priority
  {
    regex: /(create|add|new) task (.+?) due (.+?) (high|medium|low) priority/i,
    action: 'create_task',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
      deadline: parseDate(match[3]),
      priority: match[4].toLowerCase(),
    }),
  },
  // Create task with deadline
  {
    regex: /(create|add|new) task (.+?) due (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
      deadline: parseDate(match[3]),
      priority: extractPriority(match[0]),
    }),
  },
  // Create task with priority
  {
    regex: /(create|add|new) task (.+?) priority (high|medium|low)/i,
    action: 'create_task',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
      priority: match[3].toLowerCase(),
    }),
  },
  // Create task (simple)
  {
    regex: /(create|add|new) task (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
      priority: extractPriority(match[0]),
    }),
  },
  // Show/list tasks with filter
  {
    regex: /(show|list|display|view) (all )?tasks? (today|tomorrow|this week|overdue|all)?/i,
    action: 'show_tasks',
    entity: 'task',
    extract: (match) => {
      const filter = match[3]?.toLowerCase() || 'all';
      return {
        filter: filter === 'this week' ? 'all' : filter,
      };
    },
  },
  // Show tasks for specific date
  {
    regex: /(show|list|display|view) tasks? (?:for|on)? (.+)/i,
    action: 'show_tasks',
    entity: 'task',
    extract: (match) => ({
      filter: match[2].toLowerCase().includes('today') ? 'today' : 'all',
    }),
  },
  // Mark task done
  {
    regex: /(mark|complete|finish) (?:the )?task (.+?) (?:as )?(done|complete|finished)/i,
    action: 'mark_task_done',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
    }),
  },
  // Mark task done (simpler)
  {
    regex: /(mark|complete|finish) (.+?) (?:as )?(done|complete)/i,
    action: 'mark_task_done',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
    }),
  },
  // Delete task
  {
    regex: /(delete|remove) (?:the )?task (.+)/i,
    action: 'delete_task',
    entity: 'task',
    extract: (match) => ({
      title: match[2].trim(),
    }),
  },
  // Create course
  {
    regex: /(create|add|new) course (.+?)(?:\s+(?:from|on|at) (.+))?$/i,
    action: 'create_course',
    entity: 'course',
    extract: (match) => ({
      title: match[2].trim(),
      url: match[3]?.trim() || null,
    }),
  },
  // Show courses
  {
    regex: /(show|list|display|view|get) (?:all )?courses?/i,
    action: 'show_courses',
    entity: 'course',
    extract: () => ({}),
  },
  // Create reading item
  {
    regex: /(create|add|new) reading (.+?)(?:\s+(?:from|at) (.+))?$/i,
    action: 'create_reading',
    entity: 'reading',
    extract: (match) => ({
      title: match[2].trim(),
      source: match[3]?.trim() || 'Unknown',
    }),
  },
  // Show reading items
  {
    regex: /(show|list|display|view|get) (?:my )?reading (?:list|items)?/i,
    action: 'show_reading',
    entity: 'reading',
    extract: () => ({}),
  },
  // Create goal
  {
    regex: /(create|add|new) goal (.+)/i,
    action: 'create_goal',
    entity: 'goal',
    extract: (match) => ({
      title: match[2].trim(),
    }),
  },
  // Update goal progress
  {
    regex: /(update|set) goal (.+?) (?:to )?(\d+)%?/i,
    action: 'update_goal',
    entity: 'goal',
    extract: (match) => ({
      title: match[2].trim(),
      progress: parseInt(match[3]),
    }),
  },
  // Show goals
  {
    regex: /(show|list|display|view|get) (?:my )?goals?/i,
    action: 'show_goals',
    entity: 'goal',
    extract: () => ({}),
  },
  // Show stats
  {
    regex: /(show|display|get|view) (?:my )?stats?|(?:what'?s|tell me) (?:my|about) stats?/i,
    action: 'show_stats',
    entity: 'task',
    extract: () => ({}),
  },
];

export interface FallbackResult {
  success: boolean;
  command?: ParsedCommand;
  error?: string;
}

export function parseWithFallback(text: string): FallbackResult {
  for (const pattern of FALLBACK_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      return {
        success: true,
        command: {
          action: pattern.action,
          entity: pattern.entity,
          parameters: pattern.extract(match),
          confidence: 75, // Fallback patterns have lower confidence
        },
      };
    }
  }

  return {
    success: false,
    error: 'No pattern matched',
  };
}
