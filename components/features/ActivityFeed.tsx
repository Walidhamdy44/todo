import React from 'react';
import { cn } from '@/lib/utils';
import type { ActivityItem as ActivityItemType } from '@/types';
import { CheckSquare, GraduationCap, BookOpen, Target } from 'lucide-react';

interface ActivityFeedProps {
    activities: ActivityItemType[];
    className?: string;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
            ))}
        </div>
    );
}

interface ActivityItemProps {
    activity: ActivityItemType;
}

function ActivityItem({ activity }: ActivityItemProps) {
    const iconMap = {
        task: CheckSquare,
        course: GraduationCap,
        reading: BookOpen,
        goal: Target,
    };

    const colorMap = {
        task: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        course: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
        reading: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        goal: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    };

    const actionMap = {
        completed: 'Completed',
        created: 'Created',
        progressed: 'Updated progress',
        started: 'Started',
        milestone: 'Milestone reached',
    };

    const Icon = iconMap[activity.type];
    const color = colorMap[activity.type];
    const actionLabel = actionMap[activity.action as keyof typeof actionMap] || activity.action;

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className={cn('flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    <span className="font-medium">{actionLabel}:</span>{' '}
                    {activity.title}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {formatTime(activity.timestamp)}
                </p>
            </div>
        </div>
    );
}
