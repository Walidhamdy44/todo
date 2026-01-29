'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '@/types';
import { Card, StatusBadge, CircularProgress, Badge } from '@/components/ui';

interface GoalCardProps {
    goal: Goal;
    onEdit?: (goal: Goal) => void;
    onDelete?: (goalId: string) => void;
    className?: string;
}

export function GoalCard({ goal, onEdit, onDelete, className }: GoalCardProps) {
    const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
    const totalMilestones = goal.milestones.length;

    const getTimeframeColor = (timeframe: string) => {
        const colors: Record<string, 'primary' | 'warning' | 'success'> = {
            yearly: 'primary',
            quarterly: 'warning',
            monthly: 'success',
        };
        return colors[timeframe] || 'default' as 'primary';
    };

    return (
        <Card className={cn('group relative', className)} padding="md" hover>
            {/* Action buttons */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {onEdit && (
                    <button
                        onClick={() => onEdit(goal)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(goal.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex gap-4">
                {/* Progress Circle */}
                <div className="flex-shrink-0">
                    <CircularProgress value={goal.progress} size={72} variant="gradient" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getTimeframeColor(goal.timeframe)} size="sm">
                            {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)}
                        </Badge>
                        <StatusBadge status={goal.status} type="goal" />
                    </div>

                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-2 line-clamp-1">
                        {goal.title}
                    </h3>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {goal.description}
                    </p>
                </div>
            </div>

            {/* Milestones */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Milestones
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {completedMilestones}/{totalMilestones}
                    </span>
                </div>
                <div className="space-y-2">
                    {goal.milestones.slice(0, 3).map((milestone) => (
                        <div
                            key={milestone.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            {milestone.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                            )}
                            <span
                                className={cn(
                                    'truncate',
                                    milestone.isCompleted
                                        ? 'text-zinc-400 dark:text-zinc-500 line-through'
                                        : 'text-zinc-700 dark:text-zinc-300'
                                )}
                            >
                                {milestone.title}
                            </span>
                        </div>
                    ))}
                    {goal.milestones.length > 3 && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 pl-6">
                            +{goal.milestones.length - 3} more milestones
                        </p>
                    )}
                </div>
            </div>

            {/* Target Date */}
            <div className="flex items-center gap-2 mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-4 h-4" />
                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                })}
            </div>
        </Card>
    );
}
