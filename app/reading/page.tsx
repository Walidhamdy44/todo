'use client';

import React, { useState, useMemo } from 'react';
import { Search, Tag, Loader2 } from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import {
    Card,
    Input,
    Select,
    Modal,
    ModalFooter,
    Button
} from '@/components/ui';
import { ReadingCard } from '@/components/features';
import { useReadingItems, useReadingMutations } from '@/hooks';
import type { ReadingStatus, ReadingCategory, Priority } from '@/types';
import { toast } from 'sonner';

export default function ReadingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<ReadingCategory | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    // Fetch reading items from API
    const { data: items, isLoading, refetch } = useReadingItems();
    const { createItem, deleteItem, isLoading: mutating } = useReadingMutations();

    // Get all unique tags
    const allTags = useMemo(() => {
        if (!items) return [];
        const tags = new Set<string>();
        items.forEach(item => item.tags?.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [items]);

    // Filter items
    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [items, searchQuery, statusFilter, categoryFilter]);

    // Stats
    const stats = useMemo(() => {
        if (!items) return { toRead: 0, reading: 0, completed: 0, totalTime: 0 };
        const toRead = items.filter(i => i.status === 'to-read').length;
        const reading = items.filter(i => i.status === 'reading').length;
        const completed = items.filter(i => i.status === 'completed').length;
        const totalTime = items
            .filter(i => i.status !== 'completed')
            .reduce((acc, i) => acc + (i.estimatedReadingTime || 0), 0);

        return { toRead, reading, completed, totalTime };
    }, [items]);

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const handleDelete = async (itemId: string) => {
        const promise = deleteItem(itemId);
        toast.promise(promise, {
            loading: 'Deleting item...',
            success: () => {
                refetch();
                return 'Reading item deleted successfully';
            },
            error: 'Failed to delete reading item'
        });
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const promise = createItem({
            title: formData.title,
            source: formData.source,
            sourceUrl: formData.sourceUrl,
            category: formData.category as ReadingCategory,
            priority: formData.priority as Priority,
            estimatedReadingTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
            tags: formData.tags?.split(',').map(t => t.trim()).filter(Boolean),
        });

        toast.promise(promise, {
            loading: 'Adding reading item...',
            success: () => {
                refetch();
                setIsAddModalOpen(false);
                setFormData({});
                return 'Reading item added successfully';
            },
            error: 'Failed to create reading item'
        });
    };

    return (
        <>
            <Header
                title="Reading List"
                subtitle={`${stats.toRead + stats.reading} items to read · ${formatTime(stats.totalTime)} estimated`}
                onQuickAdd={() => setIsAddModalOpen(true)}
                quickAddLabel="Add Item"
            />
            <PageContainer>
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            {items?.length ?? 0}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Items</p>
                    </Card>
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-zinc-600 dark:text-zinc-400">
                            {stats.toRead}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">To Read</p>
                    </Card>
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.reading}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Reading</p>
                    </Card>
                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.completed}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Completed</p>
                    </Card>
                </div>

                {/* Filters */}
                <Card padding="md" className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by title, source, or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'to-read', label: 'To Read' },
                                    { value: 'reading', label: 'Reading' },
                                    { value: 'completed', label: 'Completed' },
                                ]}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as ReadingStatus | 'all')}
                            />
                            <Select
                                options={[
                                    { value: 'all', label: 'All Categories' },
                                    { value: 'technical', label: 'Technical' },
                                    { value: 'business', label: 'Business' },
                                    { value: 'personal-development', label: 'Personal Dev' },
                                ]}
                                value={categoryFilter}
                                onChange={(value) => setCategoryFilter(value as ReadingCategory | 'all')}
                            />
                        </div>
                    </div>

                    {/* Popular Tags */}
                    {allTags.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                Popular:
                            </span>
                            {allTags.slice(0, 8).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                )}

                {/* Reading Items Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.length === 0 ? (
                            <Card padding="lg" className="col-span-full text-center">
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    {items?.length === 0
                                        ? "No reading items yet. Add something to read!"
                                        : "No reading items match your filters"
                                    }
                                </p>
                                <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                                    Add Your First Item
                                </Button>
                            </Card>
                        ) : (
                            filteredItems.map(item => (
                                <ReadingCard
                                    key={item.id}
                                    item={item}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Add Reading Item Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add Reading Item"
                    description="Add an article, book, or resource to your reading list"
                    size="lg"
                >
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            placeholder="Enter title"
                            value={formData.title || ''}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                        />
                        <Input
                            label="Source"
                            placeholder="e.g., Medium, Book, Blog"
                            value={formData.source || ''}
                            onChange={(e) => handleFormChange('source', e.target.value)}
                        />
                        <Input
                            label="Source URL"
                            placeholder="https://..."
                            value={formData.sourceUrl || ''}
                            onChange={(e) => handleFormChange('sourceUrl', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Category"
                                options={[
                                    { value: 'technical', label: 'Technical' },
                                    { value: 'business', label: 'Business' },
                                    { value: 'personal-development', label: 'Personal Development' },
                                ]}
                                value={formData.category || ''}
                                onChange={(value) => handleFormChange('category', value)}
                                placeholder="Select category"
                            />
                            <Select
                                label="Priority"
                                options={[
                                    { value: 'high', label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low', label: 'Low' },
                                ]}
                                value={formData.priority || ''}
                                onChange={(value) => handleFormChange('priority', value)}
                                placeholder="Select priority"
                            />
                        </div>
                        <Input
                            label="Estimated Reading Time (minutes)"
                            type="number"
                            placeholder="30"
                            value={formData.estimatedTime || ''}
                            onChange={(e) => handleFormChange('estimatedTime', e.target.value)}
                        />
                        <Input
                            label="Tags (comma-separated)"
                            placeholder="react, performance, optimization"
                            value={formData.tags || ''}
                            onChange={(e) => handleFormChange('tags', e.target.value)}
                        />
                    </div>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} isLoading={mutating}>
                            Add Item
                        </Button>
                    </ModalFooter>
                </Modal>
            </PageContainer>
        </>
    );
}
