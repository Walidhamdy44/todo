'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string | boolean;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full rounded-xl border bg-white dark:bg-zinc-800/50',
                            'text-zinc-900 dark:text-zinc-100',
                            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                            'transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error
                                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-zinc-200 dark:border-zinc-700',
                            leftIcon ? 'pl-10' : 'pl-4',
                            rightIcon ? 'pr-10' : 'pr-4',
                            'py-2.5',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {(error || helperText) && (
                    <p className={cn(
                        'mt-1.5 text-sm',
                        error ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string | boolean;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full rounded-xl border bg-white dark:bg-zinc-800/50',
                        'text-zinc-900 dark:text-zinc-100',
                        'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'resize-none min-h-[100px] p-4',
                        error
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-zinc-200 dark:border-zinc-700',
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p className={cn(
                        'mt-1.5 text-sm',
                        error ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
