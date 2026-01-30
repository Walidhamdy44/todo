import { ParsedCommand } from './parser';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  displayType?: 'confirmation' | 'list' | 'stats' | 'error';
  action?: string;
}

export async function executeCommand(command: ParsedCommand): Promise<ExecutionResult> {
  try {
    switch (command.action) {
      // Task actions
      case 'create_task':
        return await createTask(command.parameters);
      case 'show_tasks':
        return await showTasks(command.parameters);
      case 'mark_task_done':
        return await markTaskDone(command.parameters);
      case 'delete_task':
        return await deleteTask(command.parameters);
      case 'update_task_priority':
        return await updateTaskPriority(command.parameters);

      // Course actions
      case 'create_course':
        return await createCourse(command.parameters);
      case 'show_courses':
        return await showCourses();
      case 'mark_video_watched':
        return await markVideoWatched(command.parameters);

      // Reading actions
      case 'create_reading':
        return await createReading(command.parameters);
      case 'show_reading':
        return await showReading();
      case 'mark_reading_read':
        return await markReadingRead(command.parameters);

      // Goal actions
      case 'create_goal':
        return await createGoal(command.parameters);
      case 'show_goals':
        return await showGoals();
      case 'update_goal_progress':
        return await updateGoalProgress(command.parameters);

      // General actions
      case 'show_dashboard_summary':
        return await showDashboardSummary();
      case 'show_stats':
        return await showStats();

      default:
        return {
          success: false,
          message: `Unknown action: ${command.action}`
        };
    }
  } catch (error) {
    console.error('Error executing command:', error);
    return {
      success: false,
      message: 'An error occurred while executing your command',
      displayType: 'error'
    };
  }
}

// ==================== TASK ACTIONS ====================

async function createTask(params: any): Promise<ExecutionResult> {
  try {
    const task = {
      title: params.title,
      description: params.description || '',
      status: 'todo',
      priority: params.priority || 'medium',
      deadline: params.deadline || new Date().toISOString().split('T')[0],
      category: params.category || 'Work'
    };

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `Task "${params.title}" created successfully!`,
        data: data,
        displayType: 'confirmation'
      };
    } else {
      return {
        success: false,
        message: 'Failed to create task'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error creating task'
    };
  }
}

async function showTasks(params: any): Promise<ExecutionResult> {
  try {
    let url = '/api/tasks?';

    if (params.filter === 'overdue') {
      url += 'overdue=true';
    } else if (params.timeframe === 'today') {
      url += `timeframe=today`;
    } else if (params.timeframe === 'tomorrow') {
      url += `timeframe=tomorrow`;
    }

    const response = await fetch(url);
    const tasks = await response.json();

    return {
      success: true,
      message: `Found ${tasks.length} task(s)`,
      data: tasks,
      displayType: 'list'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error fetching tasks'
    };
  }
}

async function markTaskDone(params: any): Promise<ExecutionResult> {
  try {
    const tasks = await fetch('/api/tasks').then(r => r.json());
    const task = tasks.find((t: any) =>
      t.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!task) {
      return {
        success: false,
        message: `Task "${params.title}" not found`
      };
    }

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' })
    });

    if (response.ok) {
      return {
        success: true,
        message: `Task "${task.title}" marked as done!`,
        displayType: 'confirmation'
      };
    } else {
      return {
        success: false,
        message: 'Failed to mark task as done'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error marking task as done'
    };
  }
}

async function deleteTask(params: any): Promise<ExecutionResult> {
  try {
    const tasks = await fetch('/api/tasks').then(r => r.json());
    const task = tasks.find((t: any) =>
      t.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!task) {
      return {
        success: false,
        message: `Task "${params.title}" not found`
      };
    }

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      return {
        success: true,
        message: `Task "${task.title}" deleted`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to delete task'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error deleting task'
    };
  }
}

async function updateTaskPriority(params: any): Promise<ExecutionResult> {
  try {
    const tasks = await fetch('/api/tasks').then(r => r.json());
    const task = tasks.find((t: any) =>
      t.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!task) {
      return {
        success: false,
        message: `Task "${params.title}" not found`
      };
    }

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: params.priority })
    });

    if (response.ok) {
      return {
        success: true,
        message: `Task "${task.title}" priority updated to ${params.priority}`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to update task priority'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error updating task priority'
    };
  }
}

// ==================== COURSE ACTIONS ====================

async function createCourse(params: any): Promise<ExecutionResult> {
  try {
    const course = {
      name: params.name || params.title,
      platform: params.url ? 'YouTube' : 'Other',
      youtube_url: params.url || null,
      status: 'not_started',
      progress: 0
    };

    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });

    if (response.ok) {
      return {
        success: true,
        message: `Course "${course.name}" created!`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to create course'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error creating course'
    };
  }
}

async function showCourses(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/courses');
    const courses = await response.json();

    return {
      success: true,
      message: `You have ${courses.length} course(s)`,
      data: courses,
      displayType: 'list'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error fetching courses'
    };
  }
}

async function markVideoWatched(params: any): Promise<ExecutionResult> {
  try {
    const courses = await fetch('/api/courses').then(r => r.json());
    const course = courses.find((c: any) =>
      c.name.toLowerCase().includes(params.courseName.toLowerCase())
    );

    if (!course) {
      return {
        success: false,
        message: `Course "${params.courseName}" not found`
      };
    }

    const response = await fetch(`/api/courses/${course.id}/lessons/${params.videoNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });

    if (response.ok) {
      return {
        success: true,
        message: `Video ${params.videoNumber} marked as watched`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to mark video as watched'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error marking video as watched'
    };
  }
}

// ==================== READING ACTIONS ====================

async function createReading(params: any): Promise<ExecutionResult> {
  try {
    const reading = {
      title: params.title || extractTitleFromURL(params.url),
      source: params.url || '',
      status: 'to_read',
      category: 'technical',
      priority: params.priority || 'medium'
    };

    const response = await fetch('/api/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading)
    });

    if (response.ok) {
      return {
        success: true,
        message: `Reading item "${reading.title}" added!`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to add reading item'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error adding reading item'
    };
  }
}

async function showReading(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/reading');
    const items = await response.json();

    return {
      success: true,
      message: `You have ${items.length} reading item(s)`,
      data: items,
      displayType: 'list'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error fetching reading items'
    };
  }
}

async function markReadingRead(params: any): Promise<ExecutionResult> {
  try {
    const items = await fetch('/api/reading').then(r => r.json());
    const item = items.find((i: any) =>
      i.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!item) {
      return {
        success: false,
        message: `Reading item "${params.title}" not found`
      };
    }

    const response = await fetch(`/api/reading/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' })
    });

    if (response.ok) {
      return {
        success: true,
        message: `"${item.title}" marked as read`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to mark as read'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error marking item as read'
    };
  }
}

// ==================== GOAL ACTIONS ====================

async function createGoal(params: any): Promise<ExecutionResult> {
  try {
    const goal = {
      title: params.title,
      description: params.description || '',
      type: 'long_term',
      progress: 0,
      target_date: params.targetDate || null,
      status: 'active'
    };

    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });

    if (response.ok) {
      return {
        success: true,
        message: `Goal "${params.title}" created!`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to create goal'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error creating goal'
    };
  }
}

async function showGoals(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/goals');
    const goals = await response.json();

    return {
      success: true,
      message: `You have ${goals.length} goal(s)`,
      data: goals,
      displayType: 'list'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error fetching goals'
    };
  }
}

async function updateGoalProgress(params: any): Promise<ExecutionResult> {
  try {
    const goals = await fetch('/api/goals').then(r => r.json());
    const goal = goals.find((g: any) =>
      g.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!goal) {
      return {
        success: false,
        message: `Goal "${params.title}" not found`
      };
    }

    const response = await fetch(`/api/goals/${goal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: params.progress })
    });

    if (response.ok) {
      return {
        success: true,
        message: `Goal "${goal.title}" updated to ${params.progress}% progress`,
        displayType: 'confirmation'
      };
    }

    return {
      success: false,
      message: 'Failed to update goal progress'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error updating goal progress'
    };
  }
}

// ==================== GENERAL ACTIONS ====================

async function showDashboardSummary(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/dashboard/stats');
    const stats = await response.json();

    return {
      success: true,
      message: `You have ${stats.tasksCount} tasks, ${stats.coursesCount} courses, and ${stats.goalsCount} goals`,
      data: stats,
      displayType: 'stats'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error fetching dashboard summary'
    };
  }
}

async function showStats(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/dashboard/stats');
    const stats = await response.json();

    return {
      success: true,
      message: `Here's your progress summary`,
      data: stats,
      displayType: 'stats'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error fetching statistics'
    };
  }
}

// ==================== HELPER FUNCTIONS ====================

function extractTitleFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Article';
  }
}
