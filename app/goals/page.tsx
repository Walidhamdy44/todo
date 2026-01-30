'use client';

import React, { useState, useMemo } from 'react';
import { Search, Target, TrendingUp, Loader2 } from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Input,
    Select,
    Modal,
    ModalFooter,
    Button,
    Textarea,
    ProgressBar,
    CircularProgress
} from '@/components/ui';
import { VoiceEnabledInput, VoiceEnabledTextarea } from '@/components/forms/VoiceEnabledInput';
import { GoalCard } from '@/components/features';
import { useGoals, useGoalMutations } from '@/hooks';
import type { GoalStatus, GoalTimeframe } from '@/types';
import { toast } from 'sonner';

export default function GoalsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');
    const [timeframeFilter, setTimeframeFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [milestones, setMilestones] = useState<string[]>(['', '', '']);

    // Fetch goals from API
    const { data: goals, isLoading, refetch } = useGoals();
    const { createGoal, deleteGoal, isLoading: mutating } = useGoalMutations();

    // Filter goals
    const filteredGoals = useMemo(() => {
        if (!goals) return [];
        return goals.filter(goal => {
            const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
            const matchesTimeframe = timeframeFilter === 'all' || goal.timeframe === timeframeFilter;
            return matchesSearch && matchesStatus && matchesTimeframe;
        });
    }, [goals, searchQuery, statusFilter, timeframeFilter]);

    // Stats
    const stats = useMemo(() => {
        if (!goals) return { activeGoals: 0, avgProgress: 0, totalMilestones: 0, completedMilestones: 0, completedGoals: 0 };
        const active = goals.filter(g => g.status === 'active');
        const avgProgress = active.length > 0
            ? Math.round(active.reduce((acc, g) => acc + g.progress, 0) / active.length)
            : 0;
        const totalMilestones = goals.reduce((acc, g) => acc + (g.milestones?.length || 0), 0);
        const completedMilestones = goals.reduce(
            (acc, g) => acc + (g.milestones?.filter(m => m.isCompleted).length || 0),
            0
        );

        return {
            activeGoals: active.length,
            avgProgress,
            totalMilestones,
            completedMilestones,
            completedGoals: goals.filter(g => g.status === 'completed').length,
        };
    }, [goals]);

    const handleDelete = async (goalId: string) => {
        const promise = deleteGoal(goalId);
        toast.promise(promise, {
            loading: 'Deleting goal...',
            success: () => {
                refetch();
                return 'Goal deleted successfully';
            },
            error: 'Failed to delete goal'
        });
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMilestoneChange = (index: number, value: string) => {
        setMilestones(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const addMilestone = () => {
        setMilestones(prev => [...prev, '']);
    };

    const handleSubmit = async () => {
        const validMilestones = milestones
            .filter(m => m.trim())
            .map((title, index) => ({
                id: `m-${Date.now()}-${index}`,
                title: title.trim(),
                isCompleted: false,
            }));

        const promise = createGoal({
            title: formData.title,
            description: formData.description,
            timeframe: formData.timeframe as GoalTimeframe,
            targetDate: formData.targetDate,
            milestones: validMilestones,
        });

        toast.promise(promise, {
            loading: 'Creating goal...',
            success: () => {
                refetch();
                setIsAddModalOpen(false);
                setFormData({});
                setMilestones(['', '', '']);
                return 'Goal created successfully';
            },
            error: 'Failed to create goal'
        });
    };

    return (
        <>
            <Header
                title="Goals & Missions"
                subtitle={`${stats.activeGoals} active goals · ${stats.avgProgress}% average progress`}
                onQuickAdd={() => setIsAddModalOpen(true)}
                quickAddLabel="Add Goal"
            />
            <PageContainer>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card padding="md" className="flex items-center gap-4">
                        <CircularProgress value={stats.avgProgress} size={60} variant="gradient" />
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Average Progress</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {stats.avgProgress}%
                            </p>
                        </div>
                    </Card>

                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {stats.activeGoals}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Goals</p>
                    </Card>

                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.completedMilestones}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Milestones Done
                        </p>
                    </Card>

                    <Card padding="md" className="text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.completedGoals}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Goals Achieved</p>
                    </Card>
                </div>

                {/* Milestones Progress Bar */}
                {stats.totalMilestones > 0 && (
                    <Card padding="md" className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    Overall Milestone Progress
                                </h3>
                            </div>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {stats.completedMilestones} / {stats.totalMilestones} milestones
                            </span>
                        </div>
                        <ProgressBar
                            value={stats.completedMilestones}
                            max={stats.totalMilestones}
                            variant="gradient"
                            size="lg"
                        />
                    </Card>
                )}

                {/* Filters */}
                <Card padding="md" className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search goals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'paused', label: 'Paused' },
                                ]}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as GoalStatus | 'all')}
                            />
                            <Select
                                options={[
                                    { value: 'all', label: 'All Timeframes' },
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'quarterly', label: 'Quarterly' },
                                    { value: 'yearly', label: 'Yearly' },
                                ]}
                                value={timeframeFilter}
                                onChange={(value) => setTimeframeFilter(value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                )}

                {/* Goals Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredGoals.length === 0 ? (
                            <Card padding="lg" className="col-span-full text-center">
                                <Target className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    {goals?.length === 0
                                        ? "No goals yet. Create your first goal!"
                                        : "No goals match your filters"
                                    }
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    Create Your First Goal
                                </Button>
                            </Card>
                        ) : (
                            filteredGoals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Add Goal Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Create New Goal"
                    description="Set a new goal to track your progress"
                    size="lg"
                >
                    <div className="space-y-4">
                        <VoiceEnabledInput
                            label="Goal Title"
                            placeholder="e.g., Become a Senior Developer"
                            value={formData.title || ''}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            voiceEnabled={true}
                        />
                        <VoiceEnabledTextarea
                            label="Description"
                            placeholder="Describe your goal and what success looks like..."
                            value={formData.description || ''}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            voiceEnabled={true}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Timeframe"
                                options={[
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'quarterly', label: 'Quarterly' },
                                    { value: 'yearly', label: 'Yearly' },
                                ]}
                                value={formData.timeframe || ''}
                                onChange={(value) => handleFormChange('timeframe', value)}
                                placeholder="Select timeframe"
                            />
                            <Input
                                label="Target Date"
                                type="date"
                                value={formData.targetDate || ''}
                                onChange={(e) => handleFormChange('targetDate', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Milestones
                            </label>
                            <div className="space-y-2">
                                {milestones.map((milestone, index) => (
                                    <VoiceEnabledInput
                                        key={index}
                                        placeholder={`Milestone ${index + 1}`}
                                        value={milestone}
                                        onChange={(e) => handleMilestoneChange(index, e.target.value)}
                                        voiceEnabled={true}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addMilestone}
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                + Add more milestones
                            </button>
                        </div>
                    </div>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} isLoading={mutating}>
                            Create Goal
                        </Button>
                    </ModalFooter>
                </Modal>
            </PageContainer>
        </>
    );
}
