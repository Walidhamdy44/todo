'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={cn(
                    'relative w-full mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl',
                    'animate-in zoom-in-95 fade-in duration-200',
                    'max-h-[90vh] overflow-hidden flex flex-col',
                    sizes[size]
                )}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                {description}
                            </p>
                        )}
                    </div>
                    {showCloseButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="p-2 -mr-2 -mt-1"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div className={cn(
            'flex items-center justify-end gap-3 pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800',
            className
        )}>
            {children}
        </div>
    );
}
