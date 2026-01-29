import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Priority, TaskStatus } from '@/types';

// GET /api/tasks - Get all tasks for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') as TaskStatus | null;
        const priority = searchParams.get('priority') as any | null;
        const category = searchParams.get('category');

        const tasks = await db.task.findMany({
            where: {
                userId: user.id,
                ...(status && { status }),
                ...(priority && { priority }),
                ...(category && { category }),
            },
            orderBy: [
                { deadline: 'asc' },
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // Transform to match frontend types
        const transformedTasks = tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority.toLowerCase() as 'high' | 'medium' | 'low',
            status: task.status === 'TODO' ? 'todo' :
                task.status === 'IN_PROGRESS' ? 'in-progress' : 'done',
            deadline: task.deadline?.toISOString().split('T')[0] ?? null,
            category: task.category,
            project: task.project,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, priority, status, deadline, category, project } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Map frontend values to Prisma enums
        const prismaStatus = status === 'todo' ? 'TODO' :
            status === 'in-progress' ? 'IN_PROGRESS' :
                status === 'done' ? 'DONE' : 'TODO';

        const prismaPriority = priority?.toUpperCase() as any || 'MEDIUM';

        const task = await db.task.create({
            data: {
                userId: user.id,
                title,
                description,
                status: prismaStatus as any,
                priority: prismaPriority,
                deadline: deadline ? new Date(deadline) : null,
                category,
                project,
            },
        });

        // Log activity
        await db.activity.create({
            data: {
                userId: user.id,
                type: 'TASK_CREATED',
                action: 'created',
                title: task.title,
                entityId: task.id,
            },
        });

        // Transform response
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

        return NextResponse.json(transformedTask, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
