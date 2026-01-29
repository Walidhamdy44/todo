'use client';

import React, { useState } from 'react';
import { Header, PageContainer } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import { User, Bell, Palette, Shield, Database, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        taskReminders: true,
        weeklyDigest: false,
    });

    return (
        <>
            <Header title="Settings" subtitle="Manage your preferences" />
            <PageContainer>
                <div className="max-w-3xl space-y-6">
                    {/* Profile Section */}
                    <Card padding="md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input label="Display Name" placeholder="Your name" defaultValue="John Doe" />
                                <Input label="Email" type="email" placeholder="your@email.com" defaultValue="john@example.com" />
                                <Input label="Time Zone" placeholder="UTC+0" defaultValue="UTC+2" />
                                <Button>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card padding="md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                                    { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                                    { key: 'taskReminders', label: 'Task Reminders', description: 'Get reminded about due tasks' },
                                    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your week' },
                                ].map(({ key, label, description }) => (
                                    <div key={key} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                                            className={`w-12 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications]
                                                    ? 'bg-blue-500'
                                                    : 'bg-zinc-300 dark:bg-zinc-600'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card padding="md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Appearance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Select
                                    label="Theme"
                                    options={[
                                        { value: 'system', label: 'System Default' },
                                        { value: 'light', label: 'Light' },
                                        { value: 'dark', label: 'Dark' },
                                    ]}
                                    defaultValue="system"
                                />
                                <Select
                                    label="Accent Color"
                                    options={[
                                        { value: 'blue', label: 'Blue' },
                                        { value: 'violet', label: 'Violet' },
                                        { value: 'emerald', label: 'Emerald' },
                                        { value: 'amber', label: 'Amber' },
                                    ]}
                                    defaultValue="blue"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data & Privacy */}
                    <Card padding="md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Data & Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">Export Data</p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Download all your data</p>
                                    </div>
                                    <Button variant="secondary">Export</Button>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Permanently delete your account and data</p>
                                    </div>
                                    <Button variant="danger">Delete</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help */}
                    <Card padding="md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" />
                                Help & Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <a href="#" className="block p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Documentation</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Learn how to use ProductiveAI</p>
                                </a>
                                <a href="#" className="block p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Contact Support</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Get help with any issues</p>
                                </a>
                                <a href="#" className="block p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Keyboard Shortcuts</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">View all available shortcuts</p>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        </>
    );
}
