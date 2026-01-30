'use client';

import React, { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import {
    Card,
    Input,
    Select,
    Modal,
    ModalFooter,
    Button,
    Textarea
} from '@/components/ui';
import { VoiceEnabledInput, VoiceEnabledTextarea } from '@/components/forms/VoiceEnabledInput';
import { CourseCard } from '@/components/features';
import { useCourses, useCourseMutations } from '@/hooks';
import type { CourseStatus } from '@/types';
import { toast } from 'sonner';

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [isYouTubeLoading, setIsYouTubeLoading] = useState(false);
    const [youtubeMetadata, setYoutubeMetadata] = useState<any>(null);
    const [youtubeError, setYoutubeError] = useState<string | null>(null);

    // Fetch courses from API
    const { data: courses, isLoading, refetch } = useCourses();
    const { createCourse, updateCourse, deleteCourse, isLoading: mutating } = useCourseMutations();

    // Get unique platforms
    const platforms = useMemo(() => {
        if (!courses) return [];
        const plats = [...new Set(courses.map(c => c.platform))];
        return plats.sort();
    }, [courses]);

    // Filter courses
    const filteredCourses = useMemo(() => {
        if (!courses) return [];
        return courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.platform.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
            const matchesPlatform = platformFilter === 'all' || course.platform === platformFilter;
            return matchesSearch && matchesStatus && matchesPlatform;
        });
    }, [courses, searchQuery, statusFilter, platformFilter]);

    // Stats
    const stats = useMemo(() => {
        if (!courses) return { total: 0, inProgress: 0, completed: 0, totalHours: '0' };
        return {
            total: courses.length,
            inProgress: courses.filter(c => c.status === 'in-progress').length,
            completed: courses.filter(c => c.status === 'completed').length,
            totalHours: courses.reduce((acc, c) => acc + (c.completedHours || 0), 0).toFixed(1),
        };
    }, [courses]);

    const handleDelete = async (courseId: string) => {
        const promise = deleteCourse(courseId);
        toast.promise(promise, {
            loading: 'Deleting course...',
            success: () => {
                refetch();
                return 'Course deleted successfully';
            },
            error: 'Failed to delete course'
        });
    };

    const handleEdit = (course: any) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            platform: course.platform,
            totalHours: course.totalHours,
            targetDate: course.targetCompletionDate,
            notes: course.notes,
            youtubeUrl: course.youtubeUrl,
        });
        if (course.youtubeUrl) {
            setYoutubeMetadata({
                type: course.youtubeType,
                id: course.youtubeId,
                thumbnailUrl: course.thumbnailUrl,
                videoCount: course.videoCount,
                title: course.name,
            });
        }
        setIsAddModalOpen(true);
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'youtubeUrl') {
            if (!value) {
                setYoutubeMetadata(null);
                setYoutubeError(null);
                return;
            }
            handleYouTubeUrl(value);
        }
    };

    const handleYouTubeUrl = async (url: string) => {
        setIsYouTubeLoading(true);
        setYoutubeError(null);
        try {
            const response = await fetch('/api/youtube/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to validate YouTube URL');
            }

            setYoutubeMetadata(data);

            // Calculate duration in hours if available
            const durationInHours = data.duration ? (data.duration / 3600).toFixed(1) : undefined;

            setFormData(prev => ({
                ...prev,
                name: prev.name || data.title,
                platform: data.type === 'video' ? 'YouTube' : 'YouTube Playlist',
                totalHours: durationInHours || prev.totalHours,
            }));
            toast.success(`Found YouTube ${data.type}`);
        } catch (error: any) {
            setYoutubeError(error.message);
            setYoutubeMetadata(null);
        } finally {
            setIsYouTubeLoading(false);
        }
    };

    const handleSubmit = async () => {
        const courseData = {
            name: formData.name,
            platform: formData.platform,
            totalHours: formData.totalHours ? parseFloat(formData.totalHours) : undefined,
            targetCompletionDate: formData.targetDate,
            notes: formData.notes,
            // YouTube fields
            youtubeUrl: formData.youtubeUrl,
            youtubeType: youtubeMetadata?.type,
            youtubeId: youtubeMetadata?.id,
            thumbnailUrl: youtubeMetadata?.thumbnailUrl,
            videoCount: youtubeMetadata?.videoCount,
        };

        const promise = editingCourse
            ? updateCourse(editingCourse.id, courseData)
            : createCourse(courseData);

        toast.promise(promise, {
            loading: editingCourse ? 'Updating course...' : 'Creating course...',
            success: () => {
                refetch();
                setIsAddModalOpen(false);
                setFormData({});
                setEditingCourse(null);
                setYoutubeMetadata(null);
                return editingCourse ? 'Course updated successfully' : 'Course created successfully';
            },
            error: (err) => err.message || `Failed to ${editingCourse ? 'update' : 'create'} course`
        });
    };

    return (
        <>
            <Header
                title="Courses & Learning"
                subtitle={`${stats.inProgress} in progress · ${stats.totalHours}h completed`}
                onQuickAdd={() => setIsAddModalOpen(true)}
                quickAddLabel="Add Course"
            />
            <PageContainer>
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            {stats.total}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Courses</p>
                    </Card>
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                            {stats.inProgress}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">In Progress</p>
                    </Card>
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.completed}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Completed</p>
                    </Card>
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.totalHours}h
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Hours Learned</p>
                    </Card>
                </div>

                {/* Filters */}
                <Card padding="md" className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'not-started', label: 'Not Started' },
                                    { value: 'in-progress', label: 'In Progress' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'paused', label: 'Paused' },
                                ]}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as CourseStatus | 'all')}
                            />
                            <Select
                                options={[
                                    { value: 'all', label: 'All Platforms' },
                                    ...platforms.map(p => ({ value: p, label: p })),
                                ]}
                                value={platformFilter}
                                onChange={(value) => setPlatformFilter(value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                )}

                {/* Courses Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.length === 0 ? (
                            <Card padding="lg" className="col-span-full text-center">
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    {courses?.length === 0
                                        ? "No courses yet. Start learning something new!"
                                        : "No courses match your filters"
                                    }
                                </p>
                                <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                                    Add Your First Course
                                </Button>
                            </Card>
                        ) : (
                            filteredCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Add Course Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setFormData({});
                        setEditingCourse(null);
                        setYoutubeMetadata(null);
                        setYoutubeError(null);
                    }}
                    title={editingCourse ? "Edit Course" : "Add New Course"}
                    description={editingCourse ? "Update course details and deadlines" : "Track a new course or learning resource"}
                    size="lg"
                >
                    <div className="space-y-4">
                        <Input
                            label="YouTube URL (Optional)"
                            placeholder="Enter video or playlist URL"
                            value={formData.youtubeUrl || ''}
                            onChange={(e) => handleFormChange('youtubeUrl', e.target.value)}
                            helperText={youtubeError || undefined}
                            error={!!youtubeError}
                            rightIcon={isYouTubeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                        />

                        {youtubeMetadata && (
                            <div className="flex gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                                <img
                                    src={youtubeMetadata.thumbnailUrl}
                                    alt="Preview"
                                    className="w-32 h-20 object-cover rounded-md shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                        {youtubeMetadata.title}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1 capitalize">
                                        {youtubeMetadata.type} {youtubeMetadata.videoCount ? `· ${youtubeMetadata.videoCount} videos` : ''}
                                    </p>
                                </div>
                            </div>
                        )}

                        <VoiceEnabledInput
                            label="Course Name"
                            placeholder="Enter course name"
                            value={formData.name || ''}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            voiceEnabled={true}
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
                            placeholder="Select platform"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Total Hours"
                                type="number"
                                placeholder="0"
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
                        <VoiceEnabledTextarea
                            label="Notes"
                            placeholder="Add any notes about this course..."
                            value={formData.notes || ''}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            voiceEnabled={true}
                        />
                    </div>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => {
                            setIsAddModalOpen(false);
                            setEditingCourse(null);
                            setFormData({});
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} isLoading={mutating}>
                            {editingCourse ? "Update Course" : "Add Course"}
                        </Button>
                    </ModalFooter>
                </Modal>
            </PageContainer>
        </>
    );
}
