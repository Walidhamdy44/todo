import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { GoalStatus, GoalTimeframe } from '@prisma/client';

// GET /api/goals - Get all goals for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const timeframe = searchParams.get('timeframe');

        const goals = await db.goal.findMany({
            where: {
                userId: user.id,
                ...(status && { status: status.toUpperCase() as GoalStatus }),
                ...(timeframe && { timeframe: timeframe.toUpperCase() as GoalTimeframe }),
            },
            orderBy: [
                { status: 'asc' },
                { progress: 'desc' },
                { targetDate: 'asc' },
            ],
        });

        // Transform to match frontend types
        const transformedGoals = goals.map((goal) => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            progress: goal.progress,
            status: goal.status.toLowerCase() as 'active' | 'completed' | 'paused',
            timeframe: goal.timeframe.toLowerCase() as 'monthly' | 'quarterly' | 'yearly',
            targetDate: goal.targetDate?.toISOString().split('T')[0] ?? null,
            milestones: goal.milestones as Array<{ id: string; title: string; isCompleted: boolean; targetDate?: string }>,
            createdAt: goal.createdAt.toISOString(),
            updatedAt: goal.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformedGoals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            timeframe,
            targetDate,
            milestones
        } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Map frontend values to Prisma enums
        const prismaTimeframe = timeframe?.toUpperCase() as GoalTimeframe || 'QUARTERLY';

        // Process milestones - add IDs if not present
        const processedMilestones = (milestones ?? []).map((m: { id?: string; title: string; isCompleted?: boolean }, index: number) => ({
            id: m.id || `m-${Date.now()}-${index}`,
            title: m.title,
            isCompleted: m.isCompleted ?? false,
        }));

        const goal = await db.goal.create({
            data: {
                userId: user.id,
                title,
                description,
                timeframe: prismaTimeframe,
                targetDate: targetDate ? new Date(targetDate) : null,
                milestones: processedMilestones,
                progress: 0,
                status: 'ACTIVE',
            },
        });

        // Log activity
        await db.activity.create({
            data: {
                userId: user.id,
                type: 'GOAL_CREATED',
                action: 'created',
                title: goal.title,
                entityId: goal.id,
            },
        });

        const transformedGoal = {
            id: goal.id,
            title: goal.title,
            description: goal.description,
            progress: goal.progress,
            status: goal.status.toLowerCase(),
            timeframe: goal.timeframe.toLowerCase(),
            targetDate: goal.targetDate?.toISOString().split('T')[0] ?? null,
            milestones: goal.milestones,
            createdAt: goal.createdAt.toISOString(),
            updatedAt: goal.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedGoal, { status: 201 });
    } catch (error) {
        console.error('Error creating goal:', error);
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}
