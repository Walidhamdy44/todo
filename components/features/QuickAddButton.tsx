'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, LucideIcon } from 'lucide-react';

interface QuickAddButtonProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'blue' | 'violet' | 'emerald' | 'amber';
    className?: string;
}

export function QuickAddButton({
    label,
    icon: Icon,
    onClick,
    variant = 'blue',
    className,
}: QuickAddButtonProps) {
    const variants = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'bg-blue-500 text-white',
            text: 'text-blue-700 dark:text-blue-400',
        },
        violet: {
            bg: 'bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30',
            border: 'border-violet-200 dark:border-violet-800',
            icon: 'bg-violet-500 text-white',
            text: 'text-violet-700 dark:text-violet-400',
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: 'bg-emerald-500 text-white',
            text: 'text-emerald-700 dark:text-emerald-400',
        },
        amber: {
            bg: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30',
            border: 'border-amber-200 dark:border-amber-800',
            icon: 'bg-amber-500 text-white',
            text: 'text-amber-700 dark:text-amber-400',
        },
    };

    const { bg, border, icon: iconStyle, text } = variants[variant];

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'border transition-all duration-200',
                'hover:shadow-md active:scale-[0.98]',
                bg,
                border,
                className
            )}
        >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconStyle)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start">
                <span className={cn('text-sm font-medium', text)}>Add {label}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Quick create</span>
            </div>
            <Plus className={cn('w-4 h-4 ml-auto', text)} />
        </button>
    );
}
