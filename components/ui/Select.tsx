'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
    Select as SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from './select-primitives';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    className?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
    ({ className, label, error, helperText, options, placeholder, onChange, value, defaultValue, disabled, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <SelectRoot
                    value={value}
                    defaultValue={defaultValue}
                    onValueChange={onChange}
                    disabled={disabled}
                >
                    <SelectTrigger
                        ref={ref}
                        className={cn(
                            'w-full bg-white dark:bg-zinc-800/50',
                            error
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-zinc-200 dark:border-zinc-700',
                            className
                        )}
                        {...props}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectRoot>
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

Select.displayName = 'Select';
