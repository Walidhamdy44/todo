'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            setIsDarkMode(savedMode === 'true');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    // Apply dark mode class to html element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(isDarkMode));
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

    if (isAuthPage) {
        return <div className="min-h-screen bg-[#0a0a0b]">{children}</div>;
    }

    return (
        <>
            <SignedIn>
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                    >
                        <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>

                    {/* Mobile Overlay */}
                    {isMobileOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsMobileOpen(false)}
                        />
                    )}

                    <Sidebar
                        isCollapsed={isCollapsed}
                        onToggle={toggleSidebar}
                        isDarkMode={isDarkMode}
                        onToggleDarkMode={toggleDarkMode}
                        isMobileOpen={isMobileOpen}
                        onMobileClose={() => setIsMobileOpen(false)}
                    />

                    <main
                        className={cn(
                            'min-h-screen transition-all duration-300',
                            isCollapsed ? 'lg:ml-20' : 'lg:ml-64',
                            'p-4 lg:p-0' // Add padding on mobile since no sidebar margin
                        )}
                    >
                        {children}
                    </main>
                </div>
            </SignedIn>
            <SignedOut>
                {/* For non-auth pages, if signed out, redirect to sign-in */}
                {!isAuthPage && <RedirectToSignIn />}
            </SignedOut>
        </>
    );
}
