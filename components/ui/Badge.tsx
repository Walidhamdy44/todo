import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className,
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

    const variants = {
        default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
        primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        secondary: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
        success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        info: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
    };

    return (
        <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
            {children}
        </span>
    );
}

// Priority-specific badges
export function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
    const config = {
        high: { variant: 'danger' as const, label: 'High' },
        medium: { variant: 'warning' as const, label: 'Medium' },
        low: { variant: 'secondary' as const, label: 'Low' },
    };

    const { variant, label } = config[priority];

    return (
        <Badge variant={variant} size="sm">
            {label}
        </Badge>
    );
}

// Status-specific badges
export function StatusBadge({ status, type }: {
    status: string;
    type: 'task' | 'course' | 'reading' | 'goal';
}) {
    const getVariant = () => {
        if (type === 'task') {
            switch (status) {
                case 'done': return 'success';
                case 'in-progress': return 'primary';
                default: return 'secondary';
            }
        }
        if (type === 'course') {
            switch (status) {
                case 'completed': return 'success';
                case 'in-progress': return 'primary';
                case 'paused': return 'warning';
                default: return 'secondary';
            }
        }
        if (type === 'reading') {
            switch (status) {
                case 'completed': return 'success';
                case 'reading': return 'primary';
                default: return 'secondary';
            }
        }
        if (type === 'goal') {
            switch (status) {
                case 'completed': return 'success';
                case 'active': return 'primary';
                default: return 'warning';
            }
        }
        return 'default';
    };

    const formatLabel = (s: string) =>
        s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <Badge variant={getVariant() as BadgeProps['variant']} size="sm">
            {formatLabel(status)}
        </Badge>
    );
}
