import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/dashboard/stats - Get aggregated dashboard stats
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get start of current week (Monday)
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysFromMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        // Tasks due today (not done)
        const tasksDueToday = await db.task.count({
            where: {
                userId: user.id,
                deadline: {
                    gte: today,
                    lt: tomorrow,
                },
                status: {
                    not: 'DONE',
                },
            },
        });

        // Active courses
        const activeCourses = await db.course.count({
            where: {
                userId: user.id,
                status: 'IN_PROGRESS',
            },
        });

        // Reading items (to-read or reading)
        const readingItems = await db.readingItem.count({
            where: {
                userId: user.id,
                status: {
                    in: ['TO_READ', 'READING'],
                },
            },
        });

        // Goals progress (average of active goals)
        const activeGoals = await db.goal.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE',
            },
            select: {
                progress: true,
            },
        });

        const goalsProgress = activeGoals.length > 0
            ? Math.round(activeGoals.reduce((sum: number, g: any) => sum + g.progress, 0) / activeGoals.length)
            : 0;

        // Tasks completed this week
        const completedThisWeek = await db.task.count({
            where: {
                userId: user.id,
                status: 'DONE',
                updatedAt: {
                    gte: startOfWeek,
                },
            },
        });

        // Calculate study streak (days with activity in courses or reading)
        // For simplicity, we'll count consecutive days with course progress updates
        const recentActivities = await db.activity.findMany({
            where: {
                userId: user.id,
                type: {
                    in: ['COURSE_PROGRESS', 'COURSE_COMPLETED', 'READING_COMPLETED'],
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 30,
        });

        let studyStreak = 0;
        const activityDates = new Set(
            recentActivities.map((a: any) => a.createdAt.toISOString().split('T')[0])
        );

        const checkDate = new Date(today);
        while (activityDates.has(checkDate.toISOString().split('T')[0])) {
            studyStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Calculate productivity score (based on completion rates)
        const totalTasks = await db.task.count({ where: { userId: user.id } });
        const doneTasks = await db.task.count({
            where: { userId: user.id, status: 'DONE' }
        });

        const totalCourses = await db.course.count({ where: { userId: user.id } });
        const completedCourses = await db.course.count({
            where: { userId: user.id, status: 'COMPLETED' }
        });

        const taskCompletion = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
        const courseCompletion = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

        const productivityScore = Math.round(
            (taskCompletion * 0.4) + (courseCompletion * 0.3) + (goalsProgress * 0.3)
        );

        return NextResponse.json({
            tasksToday: tasksDueToday,
            activeCourses,
            readingItems,
            goalsProgress,
            completedThisWeek,
            studyStreak: Math.max(studyStreak, 1), // At least 1 if they have any activity
            productivityScore: Math.min(productivityScore, 100),
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
