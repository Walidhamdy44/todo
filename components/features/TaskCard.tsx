'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { Card, PriorityBadge, StatusBadge } from '@/components/ui';

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    className?: string;
    isDraggable?: boolean;
}

export function TaskCard({
    task,
    onEdit,
    onDelete,
    className,
    isDraggable = false,
}: TaskCardProps) {
    const isOverdue = task.deadline ? new Date(task.deadline) < new Date() && task.status !== 'done' : false;

    const formatDeadline = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Card
            className={cn(
                'relative group',
                isDraggable && 'cursor-grab active:cursor-grabbing',
                isOverdue && 'border-red-200 dark:border-red-900/50',
                className
            )}
            padding="md"
            hover={!isDraggable}
        >
            {/* Action buttons */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {onEdit && (
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="pr-16">
                <div className="flex items-center gap-2 mb-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} type="task" />
                </div>

                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {task.title}
                </h3>

                {task.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {task.category}
                        </span>
                    </div>
                    <div
                        className={cn(
                            'flex items-center gap-1.5 text-sm',
                            isOverdue
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-zinc-500 dark:text-zinc-400'
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        {formatDeadline(task.deadline as any)}
                    </div>
                </div>
            </div>
        </Card>
    );
}

interface TaskListItemProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onStatusChange?: (taskId: string, status: Task['status']) => void;
    className?: string;
}

export function TaskListItem({
    task,
    onEdit,
    onDelete,
    onStatusChange,
    className,
}: TaskListItemProps) {
    const isOverdue = new Date(task.deadline as any) < new Date() && task.status !== 'done';

    return (
        <div
            className={cn(
                'flex items-center gap-4 p-4 rounded-xl',
                'bg-white dark:bg-zinc-900',
                'border border-zinc-100 dark:border-zinc-800',
                'hover:shadow-md transition-all duration-200',
                isOverdue && 'border-l-4 border-l-red-500',
                className
            )}
        >
            {/* Checkbox */}
            <button
                onClick={() =>
                    onStatusChange?.(task.id, task.status === 'done' ? 'todo' : 'done')
                }
                className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all',
                    task.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-500'
                )}
            >
                {task.status === 'done' && (
                    <svg
                        className="w-full h-full text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4
                        className={cn(
                            'font-medium',
                            task.status === 'done'
                                ? 'line-through text-zinc-400 dark:text-zinc-500'
                                : 'text-zinc-900 dark:text-zinc-100'
                        )}
                    >
                        {task.title}
                    </h4>
                    <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {task.category}
                    </span>
                    <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
                    <span
                        className={cn(
                            'text-xs',
                            isOverdue
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-zinc-400 dark:text-zinc-500'
                        )}
                    >
                        Due: {new Date(task.deadline as any).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {onEdit && (
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
