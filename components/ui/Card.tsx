import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'gradient' | 'glass';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    className,
    variant = 'default',
    hover = false,
    padding = 'md',
}: CardProps) {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variants = {
        default: 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800',
        gradient: 'bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-100 dark:border-zinc-800',
        glass: 'bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-700/20',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyles = hover
        ? 'hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 hover:-translate-y-1 cursor-pointer'
        : '';

    return (
        <div className={cn(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className, as: Component = 'h3' }: CardTitleProps) {
    return (
        <Component className={cn('text-lg font-semibold text-zinc-900 dark:text-zinc-100', className)}>
            {children}
        </Component>
    );
}

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-zinc-500 dark:text-zinc-400 mt-1', className)}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return <div className={cn(className)}>{children}</div>;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800', className)}>
            {children}
        </div>
    );
}
