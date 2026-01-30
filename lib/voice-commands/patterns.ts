export interface CommandPattern {
  regex: RegExp;
  action: string;
  entity: string;
  extract: string[];
  examples: string[];
}

export const COMMAND_PATTERNS: CommandPattern[] = [
  // ==================== TASK PATTERNS ====================

  // Create task with deadline and priority
  {
    regex: /(create|add|new) task (.+?) due (.+?) priority (high|medium|low)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title', 'deadline', 'priority'],
    examples: ['create task Review Report due tomorrow priority high']
  },

  // Create task with deadline and description
  {
    regex: /(create|add|new) task (.+?) due (.+?) description (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title', 'deadline', 'description'],
    examples: ['add task Submit Proposal due Feb 24 description Send to management']
  },

  // Create task with deadline
  {
    regex: /(create|add|new) task (.+?) due (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title', 'deadline'],
    examples: ['create task Review Report due tomorrow']
  },

  // Create task with priority
  {
    regex: /(create|add|new) task (.+?) priority (high|medium|low)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title', 'priority'],
    examples: ['add task Call Client priority high']
  },

  // Create task with description
  {
    regex: /(create|add|new) task (.+?) description (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title', 'description'],
    examples: ['create task Review Report description Check Q4 numbers']
  },

  // Create simple task
  {
    regex: /(create|add|new) task (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title'],
    examples: ['create task Review Report', 'add task Call Client']
  },

  // Show tasks for timeframe
  {
    regex: /(show|list|display) tasks (today|tomorrow)/i,
    action: 'show_tasks',
    entity: 'task',
    extract: ['timeframe'],
    examples: ['show tasks today', 'list tasks tomorrow']
  },

  // Show overdue tasks
  {
    regex: /(show|list|display) (overdue|late) tasks/i,
    action: 'show_tasks',
    entity: 'task',
    extract: ['filter'],
    examples: ['show overdue tasks', 'list late tasks']
  },

  // Show all tasks
  {
    regex: /(show|list|display) (all )?tasks/i,
    action: 'show_tasks',
    entity: 'task',
    extract: [],
    examples: ['show all tasks', 'list tasks']
  },

  // What tasks do I have
  {
    regex: /what tasks .* (today|tomorrow|this week)/i,
    action: 'show_tasks',
    entity: 'task',
    extract: ['timeframe'],
    examples: ['what tasks do I have today', 'what tasks are due tomorrow']
  },

  // Mark task as done
  {
    regex: /mark (.+?) (as )?(done|complete|finished)/i,
    action: 'mark_task_done',
    entity: 'task',
    extract: ['title'],
    examples: ['mark Review Report as done', 'mark Call Client complete']
  },

  // Complete task
  {
    regex: /complete task (.+)/i,
    action: 'mark_task_done',
    entity: 'task',
    extract: ['title'],
    examples: ['complete task Review Report']
  },

  // Delete task
  {
    regex: /(delete|remove) task (.+)/i,
    action: 'delete_task',
    entity: 'task',
    extract: ['title'],
    examples: ['delete task Review Report', 'remove task Old Task']
  },

  // Update task priority
  {
    regex: /change (.+?) to (high|medium|low) priority/i,
    action: 'update_task_priority',
    entity: 'task',
    extract: ['title', 'priority'],
    examples: ['change Review Report to high priority']
  },

  // ==================== COURSE PATTERNS ====================

  // Create course with URL
  {
    regex: /(add|create) course (.+?) from (https?:\/\/.+)/i,
    action: 'create_course',
    entity: 'course',
    extract: ['name', 'url'],
    examples: ['add course JavaScript from https://youtube.com/playlist/...']
  },

  // Create course simple
  {
    regex: /(add|create) course (.+)/i,
    action: 'create_course',
    entity: 'course',
    extract: ['name'],
    examples: ['create course JavaScript Basics']
  },

  // Show courses
  {
    regex: /(show|list|display) (my )?courses/i,
    action: 'show_courses',
    entity: 'course',
    extract: [],
    examples: ['show courses', 'list my courses']
  },

  // Mark video watched
  {
    regex: /mark video (\d+) (watched|complete) in (.+)/i,
    action: 'mark_video_watched',
    entity: 'course',
    extract: ['videoNumber', 'courseName'],
    examples: ['mark video 5 watched in JavaScript Course']
  },

  // ==================== READING PATTERNS ====================

  // Add reading item
  {
    regex: /(add|save) reading (.+)/i,
    action: 'create_reading',
    entity: 'reading',
    extract: ['title'],
    examples: ['add reading Clean Code Principles']
  },

  // Save article
  {
    regex: /(add|save) article (https?:\/\/.+)/i,
    action: 'create_reading',
    entity: 'reading',
    extract: ['url'],
    examples: ['save article https://example.com/article']
  },

  // Show reading items
  {
    regex: /(show|list|display) (my )?(reading|articles|books)/i,
    action: 'show_reading',
    entity: 'reading',
    extract: [],
    examples: ['show reading', 'list articles']
  },

  // Mark as read
  {
    regex: /mark (.+?) as read/i,
    action: 'mark_reading_read',
    entity: 'reading',
    extract: ['title'],
    examples: ['mark Clean Code as read']
  },

  // ==================== GOAL PATTERNS ====================

  // Create goal with target date
  {
    regex: /create goal (.+?) by (.+)/i,
    action: 'create_goal',
    entity: 'goal',
    extract: ['title', 'targetDate'],
    examples: ['create goal Learn React by March 31']
  },

  // Create goal simple
  {
    regex: /create goal (.+)/i,
    action: 'create_goal',
    entity: 'goal',
    extract: ['title'],
    examples: ['create goal Read 12 Books']
  },

  // Update goal progress
  {
    regex: /update goal (.+?) to (\d+) percent/i,
    action: 'update_goal_progress',
    entity: 'goal',
    extract: ['title', 'progress'],
    examples: ['update goal Learn React to 75 percent']
  },

  // Show goals
  {
    regex: /(show|list|display) (my )?goals/i,
    action: 'show_goals',
    entity: 'goal',
    extract: [],
    examples: ['show goals', 'list my goals']
  },

  // ==================== GENERAL PATTERNS ====================

  // What's on my plate
  {
    regex: /(what'?s|whats) on my plate/i,
    action: 'show_dashboard_summary',
    entity: 'general',
    extract: [],
    examples: ['what\'s on my plate', 'whats on my plate']
  },

  // Show stats
  {
    regex: /show (my )?(stats|statistics|progress)/i,
    action: 'show_stats',
    entity: 'general',
    extract: [],
    examples: ['show my stats', 'show progress']
  },

  // ==================== ARABIC PATTERNS ====================

  // Create task (Arabic)
  {
    regex: /(أنشئ|أضف) مهمة (.+)/i,
    action: 'create_task',
    entity: 'task',
    extract: ['title'],
    examples: ['أنشئ مهمة مراجعة التقرير']
  },

  // Show tasks (Arabic)
  {
    regex: /(أظهر|اعرض) (المهام|مهام)/i,
    action: 'show_tasks',
    entity: 'task',
    extract: [],
    examples: ['أظهر المهام']
  },

  // Mark task done (Arabic)
  {
    regex: /علم (.+?) (كمكتمل|مكتمل)/i,
    action: 'mark_task_done',
    entity: 'task',
    extract: ['title'],
    examples: ['علم المهمة كمكتمل']
  }
];

export function sortPatternsBySpecificity(patterns: CommandPattern[]): CommandPattern[] {
  return [...patterns].sort((a, b) => {
    // Patterns with more capture groups are more specific
    const aGroups = (a.regex.source.match(/\(/g) || []).length;
    const bGroups = (b.regex.source.match(/\(/g) || []).length;
    return bGroups - aGroups;
  });
}
