import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { GoalStatus, GoalTimeframe } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

interface Milestone {
    id: string;
    title: string;
    isCompleted: boolean;
    targetDate?: string;
}

// GET /api/goals/[id] - Get a single goal
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const goal = await db.goal.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

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

        return NextResponse.json(transformedGoal);
    } catch (error) {
        console.error('Error fetching goal:', error);
        return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
    }
}

// PATCH /api/goals/[id] - Update a goal
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingGoal = await db.goal.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingGoal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const body = await request.json();
        const {
            title,
            description,
            status,
            timeframe,
            progress,
            targetDate,
            milestones
        } = body;

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (progress !== undefined) updateData.progress = progress;
        if (targetDate !== undefined) {
            updateData.targetDate = targetDate ? new Date(targetDate) : null;
        }
        if (milestones !== undefined) {
            updateData.milestones = milestones;
        }

        if (status !== undefined) {
            updateData.status = status.toUpperCase() as GoalStatus;
        }
        if (timeframe !== undefined) {
            updateData.timeframe = timeframe.toUpperCase() as GoalTimeframe;
        }

        // Auto-calculate progress based on milestones
        if (milestones !== undefined) {
            const mileList = milestones as Milestone[];
            const completed = mileList.filter(m => m.isCompleted).length;
            const total = mileList.length;
            if (total > 0) {
                updateData.progress = Math.round((completed / total) * 100);
            }
        }

        const goal = await db.goal.update({
            where: { id },
            data: updateData,
        });

        // Log activity for completion or milestone completion
        const newStatus = status?.toUpperCase();
        if (newStatus === 'COMPLETED' && existingGoal.status !== 'COMPLETED') {
            await db.activity.create({
                data: {
                    userId: user.id,
                    type: 'GOAL_COMPLETED',
                    action: 'completed',
                    title: goal.title,
                    entityId: goal.id,
                },
            });
        } else if (milestones !== undefined) {
            const oldMilestones = existingGoal.milestones as any[];
            const newMilestones = milestones as Milestone[];

            // Find newly completed milestones
            const newlyCompleted = newMilestones.filter(nm =>
                nm.isCompleted && !oldMilestones.find(om => om.id === nm.id)?.isCompleted
            );

            if (newlyCompleted.length > 0) {
                await db.activity.create({
                    data: {
                        userId: user.id,
                        type: 'GOAL_MILESTONE',
                        action: 'milestone',
                        title: `Completed: ${newlyCompleted[0].title}`,
                        entityId: goal.id,
                    },
                });
            }
        }

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

        return NextResponse.json(transformedGoal);
    } catch (error) {
        console.error('Error updating goal:', error);
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingGoal = await db.goal.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingGoal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        await db.goal.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting goal:', error);
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }
}
