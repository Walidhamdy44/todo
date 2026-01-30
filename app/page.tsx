'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  GraduationCap,
  BookOpen,
  Target,
  Flame,
  Trophy,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Header, PageContainer } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, ModalFooter, Input, Select, Textarea } from '@/components/ui';
import {
  StatCard,
  QuickAddButton,
  ActivityFeed,
  TaskCard,
  CourseCard,
  GoalCard,
  VoiceAssistantButton,
  VoiceAssistantDialog
} from '@/components/features';
import {
  useDashboardStats,
  useTasks,
  useCourses,
  useGoals,
  useActivities,
  useTaskMutations,
  useCourseMutations,
  useGoalMutations,
  useReadingMutations
} from '@/hooks';

type QuickAddType = 'task' | 'course' | 'reading' | 'goal' | null;

export default function DashboardPage() {
  const { user } = useUser();
  const [quickAddType, setQuickAddType] = useState<QuickAddType>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);

  // Fetch data using hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: courses, refetch: refetchCourses } = useCourses();
  const { data: goals, refetch: refetchGoals } = useGoals();
  const { data: activities, refetch: refetchActivities } = useActivities(8);

  // Mutations
  const { createTask, isLoading: taskLoading } = useTaskMutations();
  const { createCourse, isLoading: courseLoading } = useCourseMutations();
  const { createItem: createReading, isLoading: readingLoading } = useReadingMutations();
  const { createGoal, isLoading: goalLoading } = useGoalMutations();

  // Get urgent tasks (due today or overdue)
  const urgentTasks = (tasks ?? [])
    .filter(task => {
      const today = new Date().toISOString().split('T')[0];
      return task.deadline && task.deadline <= today && task.status !== 'done';
    })
    .slice(0, 3);

  // Get in-progress courses
  const activeCourses = (courses ?? [])
    .filter(course => course.status === 'in-progress')
    .slice(0, 2);

  // Get active goals
  const activeGoals = (goals ?? [])
    .filter(goal => goal.status === 'active')
    .slice(0, 2);

  const handleQuickAdd = (type: QuickAddType) => {
    setQuickAddType(type);
    setFormData({});
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (quickAddType === 'task') {
        await createTask({
          title: formData.title,
          description: formData.description,
          priority: formData.priority as 'high' | 'medium' | 'low',
          deadline: formData.deadline,
          category: formData.category,
        });
        refetchTasks();
      } else if (quickAddType === 'course') {
        await createCourse({
          name: formData.name,
          platform: formData.platform,
          totalHours: formData.totalHours ? parseFloat(formData.totalHours) : undefined,
          targetCompletionDate: formData.targetDate,
        });
        refetchCourses();
      } else if (quickAddType === 'reading') {
        await createReading({
          title: formData.title,
          source: formData.source,
          sourceUrl: formData.sourceUrl,
          category: formData.category as 'technical' | 'business' | 'personal-development',
          priority: formData.priority as 'high' | 'medium' | 'low',
          estimatedReadingTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        });
      } else if (quickAddType === 'goal') {
        await createGoal({
          title: formData.title,
          description: formData.description,
          timeframe: formData.timeframe as 'monthly' | 'quarterly' | 'yearly',
          targetDate: formData.targetDate,
        });
        refetchGoals();
      }

      refetchActivities();
      setQuickAddType(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isSubmitting = taskLoading || courseLoading || readingLoading || goalLoading;

  // Keyboard shortcut for voice assistant (Alt+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        setIsVoiceDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVoiceCommandExecuted = async () => {
    // Refetch data to update UI after voice command
    refetchTasks();
    refetchCourses();
    refetchGoals();
    refetchActivities();
  };

  return (
    <>
      <Header
        title={`${getGreeting()}${user?.firstName ? `, ${user.firstName}` : ''}! 👋`}
        subtitle={formatDate()}
        showSearch={false}
      >
        <VoiceAssistantButton
          onClick={() => setIsVoiceDialogOpen(true)}
          isListening={isVoiceDialogOpen}
        />
      </Header>
      <PageContainer>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Tasks Due Today"
            value={statsLoading ? '...' : (stats?.tasksToday ?? 0)}
            subtitle="items to complete"
            icon={CheckSquare}
            variant="blue"
          />
          <StatCard
            title="Active Courses"
            value={statsLoading ? '...' : (stats?.activeCourses ?? 0)}
            subtitle="in progress"
            icon={GraduationCap}
            variant="violet"
          />
          <StatCard
            title="Reading Queue"
            value={statsLoading ? '...' : (stats?.readingItems ?? 0)}
            subtitle="articles & books"
            icon={BookOpen}
            variant="emerald"
          />
          <StatCard
            title="Goals Progress"
            value={statsLoading ? '...' : `${stats?.goalsProgress ?? 0}%`}
            subtitle="overall completion"
            icon={Target}
            variant="amber"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {statsLoading ? '...' : (stats?.completedThisWeek ?? 0)}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Completed this week
              </p>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {statsLoading ? '...' : (stats?.studyStreak ?? 0)}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Day study streak
              </p>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {statsLoading ? '...' : `${stats?.productivityScore ?? 0}%`}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Productivity score
              </p>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Add Buttons */}
            <Card padding="md">
              <CardHeader>
                <CardTitle>Quick Add</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <QuickAddButton
                    label="Task"
                    icon={CheckSquare}
                    onClick={() => handleQuickAdd('task')}
                    variant="blue"
                  />
                  <QuickAddButton
                    label="Course"
                    icon={GraduationCap}
                    onClick={() => handleQuickAdd('course')}
                    variant="violet"
                  />
                  <QuickAddButton
                    label="Reading"
                    icon={BookOpen}
                    onClick={() => handleQuickAdd('reading')}
                    variant="emerald"
                  />
                  <QuickAddButton
                    label="Goal"
                    icon={Target}
                    onClick={() => handleQuickAdd('goal')}
                    variant="amber"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Urgent Tasks */}
            {urgentTasks.length > 0 && (
              <Card padding="md">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Urgent Tasks
                  </CardTitle>
                  <a
                    href="/tasks"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all
                  </a>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {urgentTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Courses */}
            <Card padding="md">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Continue Learning</CardTitle>
                <a
                  href="/courses"
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  View all
                </a>
              </CardHeader>
              <CardContent>
                {activeCourses.length === 0 ? (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    No active courses. Start learning something new!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Overview */}
            <Card padding="md">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Goals Progress</CardTitle>
                <a
                  href="/goals"
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                >
                  View all
                </a>
              </CardHeader>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    No active goals. Set some goals to track your progress!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeGoals.map(goal => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <Card padding="md" className="sticky top-24">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities && activities.length > 0 ? (
                  <ActivityFeed activities={activities} />
                ) : (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Add Modals */}
        {/* Task Modal */}
        <Modal
          isOpen={quickAddType === 'task'}
          onClose={() => setQuickAddType(null)}
          title="Add New Task"
          description="Create a new task to track your work"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Task Title"
              placeholder="Enter task title"
              value={formData.title || ''}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Enter task description"
              value={formData.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
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
              <Input
                label="Deadline"
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => handleFormChange('deadline', e.target.value)}
              />
            </div>
            <Input
              label="Category"
              placeholder="e.g., Development, Design"
              value={formData.category || ''}
              onChange={(e) => handleFormChange('category', e.target.value)}
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setQuickAddType(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Create Task
            </Button>
          </ModalFooter>
        </Modal>

        {/* Course Modal */}
        <Modal
          isOpen={quickAddType === 'course'}
          onClose={() => setQuickAddType(null)}
          title="Add New Course"
          description="Track a new course or learning resource"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Course Name"
              placeholder="Enter course name"
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
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setQuickAddType(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Add Course
            </Button>
          </ModalFooter>
        </Modal>

        {/* Reading Modal */}
        <Modal
          isOpen={quickAddType === 'reading'}
          onClose={() => setQuickAddType(null)}
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
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setQuickAddType(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Add Item
            </Button>
          </ModalFooter>
        </Modal>

        {/* Goal Modal */}
        <Modal
          isOpen={quickAddType === 'goal'}
          onClose={() => setQuickAddType(null)}
          title="Create New Goal"
          description="Set a new goal to track your progress"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Goal Title"
              placeholder="e.g., Become a Senior Developer"
              value={formData.title || ''}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Describe your goal and what success looks like..."
              value={formData.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
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
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setQuickAddType(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Create Goal
            </Button>
          </ModalFooter>
        </Modal>

        {/* Voice Assistant Dialog */}
        <VoiceAssistantDialog
          isOpen={isVoiceDialogOpen}
          onClose={() => setIsVoiceDialogOpen(false)}
          onCommandExecuted={handleVoiceCommandExecuted}
        />
      </PageContainer>
    </>
  );
}
