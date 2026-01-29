'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CheckSquare,
    GraduationCap,
    BookOpen,
    Target,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
    color: string;
    bgColor: string;
}

const navItems: NavItem[] = [
    {
        href: '/',
        icon: LayoutDashboard,
        label: 'Dashboard',
        color: 'text-zinc-600 dark:text-zinc-400',
        bgColor: 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
    },
    {
        href: '/tasks',
        icon: CheckSquare,
        label: 'Work Tasks',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    {
        href: '/courses',
        icon: GraduationCap,
        label: 'Courses',
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
    },
    {
        href: '/reading',
        icon: BookOpen,
        label: 'Reading List',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    },
    {
        href: '/goals',
        icon: Target,
        label: 'Goals',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
    },
];

export function Sidebar({
    isCollapsed,
    onToggle,
    isDarkMode,
    onToggleDarkMode,
    isMobileOpen,
    onMobileClose
}: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen',
                'bg-white dark:bg-zinc-950',
                'border-r border-zinc-200 dark:border-zinc-800',
                'transition-all duration-300 ease-in-out',
                'flex flex-col',
                // Width & Position logic
                isCollapsed ? 'lg:w-20' : 'lg:w-64',
                'w-64', // Always 64 on mobile
                // Mobile slide logic
                isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className={cn(
                    'flex items-center gap-3 overflow-hidden transition-all duration-300',
                    isCollapsed && 'lg:justify-center'
                )}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>

                    {/* Title - Hide on desktop collapsed, show on mobile */}
                    <div className={cn(
                        "flex flex-col transition-opacity duration-300",
                        isCollapsed ? 'lg:hidden' : 'flex'
                    )}>
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            ProductiveAI
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Personal Hub
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onMobileClose} // Close on mobile click
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                                        'transition-all duration-200',
                                        'group relative',
                                        isCollapsed && 'lg:justify-center',
                                        isActive
                                            ? 'bg-zinc-100 dark:bg-zinc-800 shadow-sm'
                                            : item.bgColor
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            'flex-shrink-0 w-5 h-5 transition-colors',
                                            isActive ? item.color : 'text-zinc-500 dark:text-zinc-400',
                                            !isActive && 'group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'font-medium transition-colors',
                                            isCollapsed ? 'lg:hidden' : 'block',
                                            isActive
                                                ? 'text-zinc-900 dark:text-zinc-100'
                                                : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                                        )}
                                    >
                                        {item.label}
                                    </span>

                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-violet-500 rounded-r-full" />
                                    )}

                                    {/* Tooltip for collapsed state (Desktop only) */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom section */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                {/* Settings */}
                <Link
                    href="/settings"
                    onClick={onMobileClose}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'text-zinc-600 dark:text-zinc-400',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        'transition-all duration-200',
                        isCollapsed && 'lg:justify-center'
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span className={cn("font-medium", isCollapsed ? 'lg:hidden' : 'block')}>Settings</span>
                </Link>

                {/* Dark mode toggle */}
                <button
                    onClick={onToggleDarkMode}
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'text-zinc-600 dark:text-zinc-400',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        'transition-all duration-200',
                        isCollapsed && 'lg:justify-center'
                    )}
                >
                    {isDarkMode ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                    <span className={cn("font-medium", isCollapsed ? 'lg:hidden' : 'block')}>
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                {/* Collapse toggle - Hide on mobile */}
                <button
                    onClick={onToggle}
                    className={cn(
                        'w-full hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'text-zinc-600 dark:text-zinc-400',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        'transition-all duration-200',
                        isCollapsed && 'justify-center'
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
