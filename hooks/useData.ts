'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    tasksApi,
    coursesApi,
    readingApi,
    goalsApi,
    dashboardApi,
    activitiesApi
} from '@/lib/api';
import type { Task, Course, ReadingItem, Goal, DashboardStats, ActivityItem } from '@/types';

// =====================================
// Generic hook for data fetching
// =====================================

interface UseQueryResult<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

function useQuery<T>(
    fetcher: () => Promise<T>,
    dependencies: unknown[] = []
): UseQueryResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, dependencies);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, isLoading, error, refetch };
}

// =====================================
// Tasks Hooks
// =====================================

export function useTasks(filters?: { status?: string; priority?: string; category?: string }) {
    return useQuery<Task[]>(
        () => tasksApi.getAll(filters),
        [filters?.status, filters?.priority, filters?.category]
    );
}

export function useTask(id: string) {
    return useQuery<Task>(
        () => tasksApi.getById(id),
        [id]
    );
}

export function useTaskMutations() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createTask = async (data: Partial<Task>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await tasksApi.create(data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create task'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateTask = async (id: string, data: Partial<Task>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await tasksApi.update(id, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update task'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTask = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await tasksApi.delete(id);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete task'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createTask, updateTask, deleteTask, isLoading, error };
}

// =====================================
// Courses Hooks
// =====================================

export function useCourses(filters?: { status?: string; platform?: string }) {
    return useQuery<Course[]>(
        () => coursesApi.getAll(filters),
        [filters?.status, filters?.platform]
    );
}

export function useCourse(id: string) {
    return useQuery<Course>(
        () => coursesApi.getById(id),
        [id]
    );
}

export function useCourseMutations() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createCourse = async (data: Partial<Course>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await coursesApi.create(data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create course'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCourse = async (id: string, data: Partial<Course>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await coursesApi.update(id, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update course'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCourse = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await coursesApi.delete(id);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete course'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createCourse, updateCourse, deleteCourse, isLoading, error };
}

// =====================================
// Reading Hooks
// =====================================

export function useReadingItems(filters?: { status?: string; category?: string }) {
    return useQuery<ReadingItem[]>(
        () => readingApi.getAll(filters),
        [filters?.status, filters?.category]
    );
}

export function useReadingItem(id: string) {
    return useQuery<ReadingItem>(
        () => readingApi.getById(id),
        [id]
    );
}

export function useReadingMutations() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createItem = async (data: Partial<ReadingItem>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await readingApi.create(data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create reading item'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateItem = async (id: string, data: Partial<ReadingItem>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await readingApi.update(id, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update reading item'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteItem = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await readingApi.delete(id);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete reading item'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createItem, updateItem, deleteItem, isLoading, error };
}

// =====================================
// Goals Hooks
// =====================================

export function useGoals(filters?: { status?: string; timeframe?: string }) {
    return useQuery<Goal[]>(
        () => goalsApi.getAll(filters),
        [filters?.status, filters?.timeframe]
    );
}

export function useGoal(id: string) {
    return useQuery<Goal>(
        () => goalsApi.getById(id),
        [id]
    );
}

export function useGoalMutations() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createGoal = async (data: Partial<Goal>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await goalsApi.create(data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create goal'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateGoal = async (id: string, data: Partial<Goal>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await goalsApi.update(id, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update goal'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteGoal = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await goalsApi.delete(id);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete goal'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createGoal, updateGoal, deleteGoal, isLoading, error };
}

// =====================================
// Dashboard Hooks
// =====================================

export function useDashboardStats() {
    return useQuery<DashboardStats>(
        () => dashboardApi.getStats(),
        []
    );
}

// =====================================
// Activities Hooks
// =====================================

export function useActivities(limit = 10) {
    return useQuery<ActivityItem[]>(
        () => activitiesApi.getRecent(limit),
        [limit]
    );
}
