import { ParsedCommand } from '@/lib/gemini/client';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  displayType?: 'task' | 'list' | 'stats' | 'item';
}

/**
 * Execute parsed voice commands
 */
export async function executeCommand(command: ParsedCommand): Promise<ExecutionResult> {
  try {
    console.log('[v0] Executing command:', command.action);

    switch (command.action) {
      case 'create_task':
        return await createTask(command.parameters);

      case 'show_tasks':
        return await showTasks(command.parameters);

      case 'mark_task_done':
        return await markTaskDone(command.parameters);

      case 'delete_task':
        return await deleteTask(command.parameters);

      case 'create_course':
        return await createCourse(command.parameters);

      case 'show_courses':
        return await showCourses();

      case 'create_reading':
        return await createReading(command.parameters);

      case 'show_reading':
        return await showReading();

      case 'create_goal':
        return await createGoal(command.parameters);

      case 'update_goal':
        return await updateGoal(command.parameters);

      case 'show_goals':
        return await showGoals();

      case 'show_stats':
        return await showStats();

      default:
        return {
          success: false,
          message: 'Unknown command action',
        };
    }
  } catch (error) {
    console.error('[v0] Command execution error:', error);
    return {
      success: false,
      message: 'Failed to execute command',
    };
  }
}

// ============ Task Commands ============

async function createTask(params: any): Promise<ExecutionResult> {
  try {
    const task = {
      title: params.title || 'Untitled Task',
      description: params.description || '',
      status: 'todo',
      priority: params.priority || 'medium',
      deadline: params.deadline || null,
      category: params.category || 'Work',
    };

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `✅ Task "${params.title}" created!`,
        data: data,
        displayType: 'task',
      };
    } else {
      return {
        success: false,
        message: 'Failed to create task',
      };
    }
  } catch (error) {
    console.error('[v0] Error creating task:', error);
    return {
      success: false,
      message: 'Error creating task',
    };
  }
}

async function showTasks(params: any): Promise<ExecutionResult> {
  try {
    let url = '/api/tasks?';

    if (params.filter === 'today') {
      url += `status=todo`;
    } else if (params.filter === 'tomorrow') {
      url += `status=todo`;
    } else if (params.filter === 'overdue') {
      url += `status=todo`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await response.json();

    return {
      success: true,
      message: `📋 Found ${tasks.length} task(s)`,
      data: tasks,
      displayType: 'list',
    };
  } catch (error) {
    console.error('[v0] Error fetching tasks:', error);
    return {
      success: false,
      message: 'Failed to fetch tasks',
    };
  }
}

async function markTaskDone(params: any): Promise<ExecutionResult> {
  try {
    // Find task by title
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await response.json();

    const task = tasks.find((t: any) =>
      t.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!task) {
      return {
        success: false,
        message: `Task "${params.title}" not found`,
      };
    }

    // Update task
    const updateResponse = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });

    if (updateResponse.ok) {
      return {
        success: true,
        message: `✅ Task "${task.title}" marked as done!`,
      };
    }

    return {
      success: false,
      message: 'Failed to update task',
    };
  } catch (error) {
    console.error('[v0] Error marking task done:', error);
    return {
      success: false,
      message: 'Error marking task as done',
    };
  }
}

async function deleteTask(params: any): Promise<ExecutionResult> {
  try {
    // Find task
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await response.json();

    const task = tasks.find((t: any) =>
      t.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!task) {
      return {
        success: false,
        message: `Task "${params.title}" not found`,
      };
    }

    // Delete task
    const deleteResponse = await fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE',
    });

    if (deleteResponse.ok) {
      return {
        success: true,
        message: `🗑️ Task "${task.title}" deleted`,
      };
    }

    return {
      success: false,
      message: 'Failed to delete task',
    };
  } catch (error) {
    console.error('[v0] Error deleting task:', error);
    return {
      success: false,
      message: 'Error deleting task',
    };
  }
}

// ============ Course Commands ============

async function createCourse(params: any): Promise<ExecutionResult> {
  try {
    const course = {
      name: params.title || 'Untitled Course',
      platform: params.url ? 'YouTube' : 'Other',
      youtubeUrl: params.url || null,
      status: 'not_started',
      progress: 0,
      notes: params.description || '',
    };

    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `📚 Course "${params.title}" created!`,
        data: data,
        displayType: 'item',
      };
    }

    return {
      success: false,
      message: 'Failed to create course',
    };
  } catch (error) {
    console.error('[v0] Error creating course:', error);
    return {
      success: false,
      message: 'Error creating course',
    };
  }
}

async function showCourses(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/courses');
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const courses = await response.json();

    return {
      success: true,
      message: `📚 You have ${courses.length} course(s)`,
      data: courses,
      displayType: 'list',
    };
  } catch (error) {
    console.error('[v0] Error fetching courses:', error);
    return {
      success: false,
      message: 'Failed to fetch courses',
    };
  }
}

// ============ Reading Commands ============

async function createReading(params: any): Promise<ExecutionResult> {
  try {
    const reading = {
      title: params.title || 'Untitled Reading',
      source: params.source || 'Unknown',
      sourceUrl: params.url || '',
      status: 'to-read',
      category: params.category || 'technical',
      priority: params.priority || 'medium',
      notes: params.description || '',
    };

    const response = await fetch('/api/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    });

    if (response.ok) {
      return {
        success: true,
        message: `📖 Reading item "${params.title}" added!`,
        displayType: 'item',
      };
    }

    return {
      success: false,
      message: 'Failed to add reading item',
    };
  } catch (error) {
    console.error('[v0] Error creating reading item:', error);
    return {
      success: false,
      message: 'Error creating reading item',
    };
  }
}

async function showReading(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/reading');
    if (!response.ok) {
      throw new Error('Failed to fetch reading items');
    }

    const items = await response.json();

    return {
      success: true,
      message: `📖 You have ${items.length} reading item(s)`,
      data: items,
      displayType: 'list',
    };
  } catch (error) {
    console.error('[v0] Error fetching reading items:', error);
    return {
      success: false,
      message: 'Failed to fetch reading items',
    };
  }
}

// ============ Goal Commands ============

async function createGoal(params: any): Promise<ExecutionResult> {
  try {
    const goal = {
      title: params.title || 'Untitled Goal',
      description: params.description || '',
      timeframe: params.timeframe || 'quarterly',
      progress: 0,
      targetDate: params.deadline || null,
      status: 'active',
    };

    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `🎯 Goal "${params.title}" created!`,
        data: data,
        displayType: 'item',
      };
    }

    return {
      success: false,
      message: 'Failed to create goal',
    };
  } catch (error) {
    console.error('[v0] Error creating goal:', error);
    return {
      success: false,
      message: 'Error creating goal',
    };
  }
}

async function updateGoal(params: any): Promise<ExecutionResult> {
  try {
    // Find goal
    const response = await fetch('/api/goals');
    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }

    const goals = await response.json();

    const goal = goals.find((g: any) =>
      g.title.toLowerCase().includes(params.title.toLowerCase())
    );

    if (!goal) {
      return {
        success: false,
        message: `Goal "${params.title}" not found`,
      };
    }

    // Update progress
    const updateResponse = await fetch(`/api/goals/${goal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: params.progress || 0 }),
    });

    if (updateResponse.ok) {
      return {
        success: true,
        message: `🎯 Goal "${goal.title}" updated to ${params.progress}%`,
      };
    }

    return {
      success: false,
      message: 'Failed to update goal',
    };
  } catch (error) {
    console.error('[v0] Error updating goal:', error);
    return {
      success: false,
      message: 'Error updating goal',
    };
  }
}

async function showGoals(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/goals');
    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }

    const goals = await response.json();

    return {
      success: true,
      message: `🎯 You have ${goals.length} goal(s)`,
      data: goals,
      displayType: 'list',
    };
  } catch (error) {
    console.error('[v0] Error fetching goals:', error);
    return {
      success: false,
      message: 'Failed to fetch goals',
    };
  }
}

// ============ Stats Commands ============

async function showStats(): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const stats = await response.json();

    return {
      success: true,
      message: '📊 Here are your stats',
      data: stats,
      displayType: 'stats',
    };
  } catch (error) {
    console.error('[v0] Error fetching stats:', error);
    return {
      success: false,
      message: 'Failed to fetch stats',
    };
  }
}
