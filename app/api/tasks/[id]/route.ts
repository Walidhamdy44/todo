import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TaskStatus, Priority } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Get a single task
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const task = await db.task.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const transformedTask = {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority.toLowerCase(),
            status: task.status === 'TODO' ? 'todo' :
                task.status === 'IN_PROGRESS' ? 'in-progress' : 'done',
            deadline: task.deadline?.toISOString().split('T')[0] ?? null,
            category: task.category,
            project: task.project,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedTask);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingTask = await db.task.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const body = await request.json();
        const { title, description, priority, status, deadline, category, project } = body;

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (project !== undefined) updateData.project = project;
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

        if (priority !== undefined) {
            updateData.priority = priority.toUpperCase() as Priority;
        }

        if (status !== undefined) {
            updateData.status = status === 'todo' ? 'TODO' :
                status === 'in-progress' ? 'IN_PROGRESS' : 'DONE';
        }

        const task = await db.task.update({
            where: { id },
            data: updateData,
        });

        // Log activity for status changes
        if (status === 'done' && existingTask.status !== 'DONE') {
            await db.activity.create({
                data: {
                    userId: user.id,
                    type: 'TASK_COMPLETED',
                    action: 'completed',
                    title: task.title,
                    entityId: task.id,
                },
            });
        } else if (status !== existingTask.status.toLowerCase()) {
            await db.activity.create({
                data: {
                    userId: user.id,
                    type: 'TASK_UPDATED',
                    action: 'updated',
                    title: task.title,
                    entityId: task.id,
                },
            });
        }

        const transformedTask = {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority.toLowerCase(),
            status: task.status === 'TODO' ? 'todo' :
                task.status === 'IN_PROGRESS' ? 'in-progress' : 'done',
            deadline: task.deadline?.toISOString().split('T')[0] ?? null,
            category: task.category,
            project: task.project,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingTask = await db.task.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        await db.task.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
