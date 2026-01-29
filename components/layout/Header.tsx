'use client';

import React from 'react';
import { Search, Bell, Plus, ChevronLeft } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface HeaderProps {
    title: string;
    subtitle?: string;
    onQuickAdd?: () => void;
    quickAddLabel?: string;
    backAction?: () => void;
    showSearch?: boolean;
    children?: React.ReactNode;
}

export function Header({
    title,
    subtitle,
    onQuickAdd,
    quickAddLabel = 'Add New',
    backAction,
    showSearch = true,
    children
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Left: Title */}
                <div className="flex items-center gap-3">
                    {backAction && (
                        <button
                            onClick={backAction}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Custom children */}
                    {children}
                    {/* Search */}
                    {showSearch && (
                        <div className="hidden md:flex items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className={cn(
                                        'w-64 pl-10 pr-4 py-2 rounded-xl',
                                        'bg-zinc-100 dark:bg-zinc-800/50',
                                        'border border-transparent',
                                        'text-sm text-zinc-900 dark:text-zinc-100',
                                        'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                                        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-zinc-800',
                                        'focus:border-blue-500',
                                        'transition-all duration-200'
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Quick Add Button */}
                    {onQuickAdd && (
                        <Button
                            onClick={onQuickAdd}
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            <span className="hidden sm:inline">{quickAddLabel}</span>
                        </Button>
                    )}

                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* User */}
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'w-9 h-9'
                                }
                            }}
                        />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="secondary" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </header>
    );
}
