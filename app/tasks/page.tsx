'use client';

import React, { useState, useMemo } from 'react';
import {
    LayoutGrid,
    List,
    Search,
    Plus,
    Loader2
} from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Input,
    Select,
    Modal,
    ModalFooter,
    Badge,
    Textarea
} from '@/components/ui';
import { TaskCard, TaskListItem } from '@/components/features';
import { useTasks, useTaskMutations } from '@/hooks';
import type { Task, Priority, TaskStatus } from '@/types';
import { toast } from 'sonner';

type ViewMode = 'kanban' | 'list';

export default function TasksPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    // Fetch tasks from API
    const { data: tasks, isLoading, refetch } = useTasks();
    const { createTask, updateTask, deleteTask, isLoading: mutating } = useTaskMutations();

    // Get unique categories
    const categories = useMemo(() => {
        if (!tasks) return [];
        const cats = [...new Set(tasks.map(t => t.category).filter(Boolean) as string[])];
        return cats.sort();
    }, [tasks]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
            return matchesSearch && matchesPriority && matchesCategory;
        });
    }, [tasks, searchQuery, priorityFilter, categoryFilter]);

    // Group tasks by status for Kanban
    const tasksByStatus = useMemo(() => {
        return {
            todo: filteredTasks.filter(t => t.status === 'todo'),
            'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
            done: filteredTasks.filter(t => t.status === 'done'),
        };
    }, [filteredTasks]);

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        const promise = updateTask(taskId, { status: newStatus });
        toast.promise(promise, {
            loading: 'Updating task status...',
            success: () => {
                refetch();
                return `Task marked as ${newStatus}`;
            },
            error: 'Failed to update task'
        });
    };

    const handleDelete = async (taskId: string) => {
        const promise = deleteTask(taskId);
        toast.promise(promise, {
            loading: 'Deleting task...',
            success: () => {
                refetch();
                return 'Task deleted successfully';
            },
            error: 'Failed to delete task'
        });
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const promise = createTask({
            title: formData.title,
            description: formData.description,
            priority: formData.priority as Priority,
            deadline: formData.deadline,
            category: formData.category,
        });

        toast.promise(promise, {
            loading: 'Creating task...',
            success: () => {
                refetch();
                setIsAddModalOpen(false);
                setFormData({});
                return 'Task created successfully';
            },
            error: 'Failed to create task'
        });
    };

    const statusColumns: { key: TaskStatus; label: string; color: string }[] = [
        { key: 'todo', label: 'To Do', color: 'bg-zinc-500' },
        { key: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
        { key: 'done', label: 'Done', color: 'bg-emerald-500' },
    ];

    return (
        <>
            <Header
                title="Work Tasks"
                subtitle={`${filteredTasks.length} tasks`}
                onQuickAdd={() => setIsAddModalOpen(true)}
                quickAddLabel="Add Task"
            />
            <PageContainer>
                {/* Filters & Controls */}
                <Card padding="md" className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3">
                            <Select
                                options={[
                                    { value: 'all', label: 'All Priorities' },
                                    { value: 'high', label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low', label: 'Low' },
                                ]}
                                value={priorityFilter}
                                onChange={(value) => setPriorityFilter(value as Priority | 'all')}
                            />

                            <Select
                                options={[
                                    { value: 'all', label: 'All Categories' },
                                    ...categories.map(cat => ({ value: cat, label: cat })),
                                ]}
                                value={categoryFilter}
                                onChange={(value) => setCategoryFilter(value)}
                            />

                            {/* View Toggle */}
                            <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 p-1">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban'
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}

                {/* Kanban View */}
                {!isLoading && viewMode === 'kanban' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {statusColumns.map(({ key, label, color }) => (
                            <div key={key} className="flex flex-col">
                                {/* Column Header */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${color}`} />
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {label}
                                    </h3>
                                    <Badge variant="secondary" size="sm">
                                        {tasksByStatus[key].length}
                                    </Badge>
                                </div>

                                {/* Column Content */}
                                <div className="flex-1 space-y-3 min-h-[200px] p-3 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30">
                                    {tasksByStatus[key].map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onDelete={handleDelete}
                                            isDraggable
                                        />
                                    ))}
                                    {tasksByStatus[key].length === 0 && (
                                        <div className="flex items-center justify-center h-32 text-zinc-400 dark:text-zinc-500 text-sm">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {!isLoading && viewMode === 'list' && (
                    <div className="space-y-3">
                        {filteredTasks.length === 0 ? (
                            <Card padding="lg" className="text-center">
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    No tasks match your filters
                                </p>
                            </Card>
                        ) : (
                            filteredTasks.map(task => (
                                <TaskListItem
                                    key={task.id}
                                    task={task}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Add Task Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add New Task"
                    description="Create a new task to track your work"
                    size="lg"
                >
                    <div className="space-y-4">
                        <Input
                            label="Task Title"
                            placeholder="Enter task title"
                            value={formData.title || ''}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Enter task description"
                            value={formData.description || ''}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Priority"
                                options={[
                                    { value: 'high', label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low', label: 'Low' },
                                ]}
                                value={formData.priority || ''}
                                onChange={(value) => handleFormChange('priority', value)}
                                placeholder="Select priority"
                            />
                            <Input
                                label="Deadline"
                                type="date"
                                value={formData.deadline || ''}
                                onChange={(e) => handleFormChange('deadline', e.target.value)}
                            />
                        </div>
                        <Input
                            label="Category"
                            placeholder="e.g., Development, Design"
                            value={formData.category || ''}
                            onChange={(e) => handleFormChange('category', e.target.value)}
                        />
                    </div>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} isLoading={mutating}>
                            Create Task
                        </Button>
                    </ModalFooter>
                </Modal>
            </PageContainer>
        </>
    );
}
