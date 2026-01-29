'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    ExternalLink,
    CheckCircle2,
    Circle,
    Clock,
    Youtube,
    Loader2
} from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import { Card, Button, ProgressBar, StatusBadge, Modal, ModalFooter, Input, Textarea, Select } from '@/components/ui';
import { useCourses, useCourseMutations } from '@/hooks';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course, Lesson } from '@/types';
import { toast } from 'sonner';

export default function CourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: courses, refetch } = useCourses();
    const { updateCourse, isLoading: mutating } = useCourseMutations();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});

    const course = courses?.find(c => c.id === id);

    useEffect(() => {
        if (id) {
            fetchLessons();
        }
    }, [id]);

    const fetchLessons = async () => {
        try {
            const response = await fetch(`/api/courses/${id}/lessons`);
            const data = await response.json();
            setLessons(data);
        } catch (error) {
            console.error('Failed to fetch lessons:', error);
        } finally {
            setIsLoadingLessons(false);
        }
    };

    const handleEditOpen = () => {
        if (!course) return;
        setFormData({
            name: course.name,
            platform: course.platform,
            totalHours: course.totalHours,
            targetDate: course.targetCompletionDate,
            notes: course.notes,
        });
        setIsEditModalOpen(true);
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!id) return;

        const promise = updateCourse(id as string, {
            name: formData.name,
            platform: formData.platform,
            totalHours: formData.totalHours ? parseFloat(formData.totalHours) : undefined,
            targetCompletionDate: formData.targetDate,
            notes: formData.notes,
        });

        toast.promise(promise, {
            loading: 'Updating course...',
            success: () => {
                refetch();
                setIsEditModalOpen(false);
                return 'Course updated successfully';
            },
            error: 'Failed to update course'
        });
    };

    const toggleLesson = async (lessonId: string, currentStatus: boolean) => {
        const promise = fetch(`/api/courses/${id}/lessons/${lessonId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCompleted: !currentStatus }),
        });

        toast.promise(promise, {
            loading: currentStatus ? 'Marking lesson as incomplete...' : 'Marking lesson as complete...',
            success: () => {
                // Update local state for immediate feedback
                setLessons(prev => prev.map(l =>
                    l.id === lessonId ? { ...l, isCompleted: !currentStatus } : l
                ));
                refetch(); // Update course progress
                return currentStatus ? 'Lesson marked as incomplete' : 'Lesson completed!';
            },
            error: 'Failed to update lesson'
        });
    };

    if (!course && !isLoadingLessons) {
        return (
            <PageContainer>
                <div className="text-center py-20">
                    <p className="text-zinc-500">Course not found</p>
                    <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </PageContainer>
        );
    }

    const formatDuration = (seconds: number) => {
        if (seconds === 0) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Header
                title={course?.name || 'Loading...'}
                subtitle={course?.platform}
                backAction={() => router.back()}
            >
                {course?.youtubeUrl && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(course.youtubeUrl!, '_blank')}
                        className="gap-2"
                    >
                        <Youtube className="w-4 h-4 text-red-500" />
                        View on YouTube
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                )}
            </Header>

            <PageContainer>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Lesson List */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card padding="none">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    Course Curriculum
                                </h3>
                                <span className="text-sm text-zinc-500">
                                    {lessons.filter(l => l.isCompleted).length} / {lessons.length} Completed
                                </span>
                            </div>

                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {isLoadingLessons ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
                                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                        <p className="text-sm">Loading lessons...</p>
                                    </div>
                                ) : lessons.length === 0 ? (
                                    <div className="p-12 text-center text-zinc-500">
                                        No lessons found for this course.
                                    </div>
                                ) : (
                                    lessons.map((lesson, index) => (
                                        <div
                                            key={lesson.id}
                                            className={cn(
                                                "flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group",
                                                lesson.isCompleted && "bg-zinc-50/30 dark:bg-zinc-900/10"
                                            )}
                                        >
                                            <button
                                                onClick={() => toggleLesson(lesson.id, lesson.isCompleted)}
                                                className={cn(
                                                    "shrink-0 transition-colors",
                                                    lesson.isCompleted ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-700 hover:text-emerald-500"
                                                )}
                                            >
                                                {lesson.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                            </button>

                                            <div className="relative shrink-0 w-24 h-14 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                {lesson.thumbnailUrl ? (
                                                    <img
                                                        src={lesson.thumbnailUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Youtube className="w-6 h-6 text-zinc-300" />
                                                    </div>
                                                )}
                                                {lesson.duration > 0 && (
                                                    <div className="absolute bottom-1 right-1 px-1 bg-black/70 rounded text-[10px] text-white font-medium">
                                                        {formatDuration(lesson.duration)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    "text-sm font-medium line-clamp-1",
                                                    lesson.isCompleted ? "text-zinc-500 dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100"
                                                )}>
                                                    {index + 1}. {lesson.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {lesson.youtubeVideoId && (
                                                        <a
                                                            href={`https://youtube.com/watch?v=${lesson.youtubeVideoId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                                                        >
                                                            Watch <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar: Stats & Info */}
                    <div className="space-y-6">
                        <Card padding="md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    Course Progress
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleEditOpen}
                                    className="h-8 w-8 p-0"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-zinc-500">Overall Completion</span>
                                        <span className="text-sm font-bold text-violet-600">{course?.progress}%</span>
                                    </div>
                                    <ProgressBar value={course?.progress || 0} variant="gradient" size="lg" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="text-center">
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Completed</p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{lessons.filter(l => l.isCompleted).length}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Videos</p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{lessons.length}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {course?.notes && (
                            <Card padding="md">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                    Course Notes
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                    {course.notes}
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </PageContainer>
            {/* Edit Course Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Course Details"
                description="Update the course deadline, total hours, and other settings."
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Course Name"
                        value={formData.name || ''}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                    <Select
                        label="Platform"
                        options={[
                            { value: 'Udemy', label: 'Udemy' },
                            { value: 'Coursera', label: 'Coursera' },
                            { value: 'Frontend Masters', label: 'Frontend Masters' },
                            { value: 'Pluralsight', label: 'Pluralsight' },
                            { value: 'LinkedIn Learning', label: 'LinkedIn Learning' },
                            { value: 'Educative', label: 'Educative' },
                            { value: 'A Cloud Guru', label: 'A Cloud Guru' },
                            { value: 'Other', label: 'Other' },
                        ]}
                        value={formData.platform || ''}
                        onChange={(value) => handleFormChange('platform', value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Total Hours"
                            type="number"
                            value={formData.totalHours || ''}
                            onChange={(e) => handleFormChange('totalHours', e.target.value)}
                        />
                        <Input
                            label="Target Completion Date"
                            type="date"
                            value={formData.targetDate || ''}
                            onChange={(e) => handleFormChange('targetDate', e.target.value)}
                        />
                    </div>
                    <Textarea
                        label="Notes"
                        value={formData.notes || ''}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                    />
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} isLoading={mutating}>
                        Update Course
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}
