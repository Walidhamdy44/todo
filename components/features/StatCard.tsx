import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'blue' | 'violet' | 'emerald' | 'amber' | 'default';
    className?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = 'default',
    className,
}: StatCardProps) {
    const variants = {
        default: {
            bg: 'bg-white dark:bg-zinc-900',
            icon: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
            gradient: '',
        },
        blue: {
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            icon: 'bg-white/20 text-white',
            gradient: 'text-white',
        },
        violet: {
            bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
            icon: 'bg-white/20 text-white',
            gradient: 'text-white',
        },
        emerald: {
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            icon: 'bg-white/20 text-white',
            gradient: 'text-white',
        },
        amber: {
            bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
            icon: 'bg-white/20 text-white',
            gradient: 'text-white',
        },
    };

    const { bg, icon: iconStyle, gradient } = variants[variant];
    const isGradient = variant !== 'default';

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                'border border-zinc-100 dark:border-zinc-800',
                'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                bg,
                isGradient && 'shadow-lg',
                className
            )}
        >
            {/* Background decoration */}
            {isGradient && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            )}

            <div className="relative flex items-start justify-between">
                <div>
                    <p
                        className={cn(
                            'text-sm font-medium',
                            isGradient
                                ? 'text-white/80'
                                : 'text-zinc-500 dark:text-zinc-400'
                        )}
                    >
                        {title}
                    </p>
                    <p
                        className={cn(
                            'text-3xl font-bold mt-2',
                            isGradient
                                ? 'text-white'
                                : 'text-zinc-900 dark:text-zinc-100'
                        )}
                    >
                        {value}
                    </p>
                    {subtitle && (
                        <p
                            className={cn(
                                'text-sm mt-1',
                                isGradient
                                    ? 'text-white/70'
                                    : 'text-zinc-500 dark:text-zinc-400'
                            )}
                        >
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    isGradient
                                        ? trend.isPositive
                                            ? 'text-emerald-200'
                                            : 'text-red-200'
                                        : trend.isPositive
                                            ? 'text-emerald-500'
                                            : 'text-red-500'
                                )}
                            >
                                {trend.isPositive ? '+' : ''}
                                {trend.value}%
                            </span>
                            <span
                                className={cn(
                                    'text-xs',
                                    isGradient
                                        ? 'text-white/60'
                                        : 'text-zinc-400 dark:text-zinc-500'
                                )}
                            >
                                vs last week
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                        iconStyle
                    )}
                >
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
