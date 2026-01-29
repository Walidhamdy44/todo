import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number; // 0-100
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
    showValue?: boolean;
    animated?: boolean;
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    size = 'md',
    variant = 'default',
    showValue = false,
    animated = true,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const variants = {
        default: 'bg-blue-500 dark:bg-blue-600',
        success: 'bg-emerald-500 dark:bg-emerald-600',
        warning: 'bg-amber-500 dark:bg-amber-600',
        danger: 'bg-red-500 dark:bg-red-600',
        gradient: 'bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500',
    };

    // Auto-determine variant based on percentage if using default
    const getAutoVariant = () => {
        if (variant !== 'default') return variants[variant];
        if (percentage >= 75) return variants.success;
        if (percentage >= 50) return variants.default;
        if (percentage >= 25) return variants.warning;
        return variants.danger;
    };

    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between mb-1">
                {showValue && (
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>
            <div
                className={cn(
                    'w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden',
                    sizes[size]
                )}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        variant === 'gradient' ? variants.gradient : getAutoVariant(),
                        animated && 'animate-pulse-slow'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success' | 'primary' | 'gradient';
    showValue?: boolean;
    className?: string;
}

export function CircularProgress({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    variant = 'primary',
    showValue = true,
    className,
}: CircularProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colors = {
        default: 'stroke-zinc-500',
        success: 'stroke-emerald-500',
        primary: 'stroke-blue-500',
        gradient: 'stroke-[url(#gradient)]',
    };

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                </defs>
                <circle
                    className="stroke-zinc-200 dark:stroke-zinc-700"
                    fill="none"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={cn(colors[variant], 'transition-all duration-500 ease-out')}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset,
                    }}
                    stroke={variant === 'gradient' ? 'url(#gradient)' : undefined}
                />
            </svg>
            {showValue && (
                <span className="absolute text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}
