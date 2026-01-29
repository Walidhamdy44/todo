// =====================================
// Core Types & Enums
// =====================================

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type CourseStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';
export type ReadingStatus = 'to-read' | 'reading' | 'completed';
export type ReadingCategory = 'technical' | 'business' | 'personal-development';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalTimeframe = 'quarterly' | 'monthly' | 'yearly';

// =====================================
// Task Types
// =====================================

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    priority: Priority;
    status: TaskStatus;
    deadline?: string | null; // ISO date string
    category?: string | null;
    project?: string | null;
    createdAt: string;
    updatedAt: string;
}

// =====================================
// Course Types
// =====================================

export interface Course {
    id: string;
    name: string;
    platform: string;
    progress: number; // 0-100
    status: CourseStatus;
    nextLesson?: string | null;
    targetCompletionDate?: string | null;
    totalHours?: number | null;
    completedHours: number;
    notes?: string | null;
    thumbnail?: string | null;

    // YouTube fields
    youtubeUrl?: string | null;
    youtubeType?: 'video' | 'playlist' | null;
    youtubeId?: string | null;
    thumbnailUrl?: string | null;
    videoCount?: number | null;
    totalLessons?: number;
    completedLessonsCount?: number;

    createdAt: string;
    updatedAt: string;
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    youtubeVideoId?: string | null;
    thumbnailUrl?: string | null;
    duration: number;
    orderIndex: number;
    isCompleted: boolean;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}


// =====================================
// Reading Types
// =====================================

export interface ReadingItem {
    id: string;
    title: string;
    source: string;
    sourceUrl?: string | null;
    category: ReadingCategory;
    priority: Priority;
    status: ReadingStatus;
    estimatedReadingTime?: number | null; // in minutes
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

// =====================================
// Goal Types
// =====================================

export interface Milestone {
    id: string;
    title: string;
    isCompleted: boolean;
    targetDate?: string;
}

export interface Goal {
    id: string;
    title: string;
    description?: string | null;
    progress: number; // 0-100
    status: GoalStatus;
    timeframe: GoalTimeframe;
    milestones?: Milestone[];
    targetDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

// =====================================
// Dashboard Stats Types
// =====================================

export interface DashboardStats {
    tasksToday: number;
    activeCourses: number;
    readingItems: number;
    goalsProgress: number;
    completedThisWeek: number;
    studyStreak: number;
    productivityScore: number;
}

export interface ActivityItem {
    id: string;
    type: 'task' | 'course' | 'reading' | 'goal';
    action: string;
    title: string;
    timestamp: string;
}
