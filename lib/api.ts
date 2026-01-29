import type { Task, Course, ReadingItem, Goal, ActivityItem, DashboardStats } from '@/types';

const API_BASE = '/api';

// =====================================
// Generic fetch wrapper with error handling
// =====================================

async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// =====================================
// Tasks API
// =====================================

export const tasksApi = {
    getAll: (filters?: { status?: string; priority?: string; category?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.priority) params.set('priority', filters.priority);
        if (filters?.category) params.set('category', filters.category);
        const query = params.toString();
        return fetchApi<Task[]>(`/tasks${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => fetchApi<Task>(`/tasks/${id}`),

    create: (data: Partial<Task>) =>
        fetchApi<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Task>) =>
        fetchApi<Task>(`/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/tasks/${id}`, {
            method: 'DELETE',
        }),
};

// =====================================
// Courses API
// =====================================

export const coursesApi = {
    getAll: (filters?: { status?: string; platform?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.platform) params.set('platform', filters.platform);
        const query = params.toString();
        return fetchApi<Course[]>(`/courses${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => fetchApi<Course>(`/courses/${id}`),

    create: (data: Partial<Course>) =>
        fetchApi<Course>('/courses', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Course>) =>
        fetchApi<Course>(`/courses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/courses/${id}`, {
            method: 'DELETE',
        }),
};

// =====================================
// Reading Items API
// =====================================

export const readingApi = {
    getAll: (filters?: { status?: string; category?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.category) params.set('category', filters.category);
        const query = params.toString();
        return fetchApi<ReadingItem[]>(`/reading${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => fetchApi<ReadingItem>(`/reading/${id}`),

    create: (data: Partial<ReadingItem>) =>
        fetchApi<ReadingItem>('/reading', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<ReadingItem>) =>
        fetchApi<ReadingItem>(`/reading/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/reading/${id}`, {
            method: 'DELETE',
        }),
};

// =====================================
// Goals API
// =====================================

export const goalsApi = {
    getAll: (filters?: { status?: string; timeframe?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.timeframe) params.set('timeframe', filters.timeframe);
        const query = params.toString();
        return fetchApi<Goal[]>(`/goals${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => fetchApi<Goal>(`/goals/${id}`),

    create: (data: Partial<Goal>) =>
        fetchApi<Goal>('/goals', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Goal>) =>
        fetchApi<Goal>(`/goals/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/goals/${id}`, {
            method: 'DELETE',
        }),
};

// =====================================
// Dashboard API
// =====================================

export const dashboardApi = {
    getStats: () => fetchApi<DashboardStats>('/dashboard/stats'),
};

// =====================================
// Activities API
// =====================================

export const activitiesApi = {
    getRecent: (limit = 10) =>
        fetchApi<ActivityItem[]>(`/activities?limit=${limit}`),
};
