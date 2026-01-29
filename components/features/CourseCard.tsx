'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { Course, Lesson } from '@/types';
import { Card, Button, ProgressBar, StatusBadge } from '@/components/ui';
import { useCourses } from '@/hooks';

import Link from 'next/link';

interface CourseCardProps {
    course: Course;
    onEdit?: (course: Course) => void;
    onDelete?: (courseId: string) => void;
    className?: string;
}

export function CourseCard({ course, onEdit, onDelete, className }: CourseCardProps) {
    const getPlatformColor = (platform: string) => {
        const colors: Record<string, string> = {
            'Frontend Masters': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            'Udemy': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
            'Coursera': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'Educative': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'A Cloud Guru': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            'Pluralsight': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
            'LinkedIn Learning': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'YouTube': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            'YouTube Playlist': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[platform] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
    };

    const getStatusIcon = () => {
        switch (course.status) {
            case 'in-progress':
                return <Play className="w-4 h-4" />;
            case 'paused':
                return <Pause className="w-4 h-4" />;
            case 'completed':
                return null;
            default:
                return <RotateCcw className="w-4 h-4" />;
        }
    };

    return (
        <Link href={`/courses/${course.id}`} className="block">
            <Card className={cn('group', className)} padding="none" hover>
                {/* Thumbnail / Header */}
                <div className="relative h-40 bg-gradient-to-br from-violet-500 to-purple-600 rounded-t-2xl overflow-hidden">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-black/20" />
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center justify-between">
                            <span className={cn('text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md', getPlatformColor(course.platform))}>
                                {course.platform}
                            </span>
                            <StatusBadge status={course.status} type="course" />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit(course);
                                }}
                                className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(course.id);
                                }}
                                className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-red-500/80 text-white transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                        {course.name}
                    </h3>

                    {course.nextLesson && course.status !== 'completed' && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                            Next: {course.nextLesson}
                        </p>
                    )}

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                {course.youtubeType === 'playlist' ? (
                                    <span className="flex items-center gap-1.5">
                                        Progress <span className="text-[11px] text-zinc-400">({course.completedLessonsCount || 0}/{course.totalLessons || 0} Lessons)</span>
                                    </span>
                                ) : 'Progress'}
                            </span>
                            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                {course.progress}%
                            </span>
                        </div>
                        <ProgressBar value={course.progress} variant="gradient" size="md" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {course.totalHours ? (
                                <>
                                    <span className="font-medium">{course.completedHours.toFixed(1)}</span>
                                    <span>/</span>
                                    <span>{course.totalHours}h</span>
                                </>
                            ) : (
                                <span className="text-xs text-zinc-400">No duration set</span>
                            )}
                        </div>
                        {course.targetCompletionDate && (
                            <div className="text-sm text-zinc-400 dark:text-zinc-500">
                                Target: {new Date(course.targetCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
