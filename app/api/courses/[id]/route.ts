import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { CourseStatus } from '@/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/courses/[id] - Get a single course
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const course = await db.course.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const transformedCourse = {
            id: course.id,
            name: course.name,
            platform: course.platform,
            progress: course.progress,
            status: course.status.toLowerCase().replace('_', '-'),
            nextLesson: course.nextLesson,
            targetCompletionDate: course.targetCompletionDate?.toISOString().split('T')[0] ?? null,
            totalHours: course.totalHours ?? 0,
            completedHours: course.completedHours,
            notes: course.notes,
            thumbnail: course.thumbnail,
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedCourse);
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
    }
}

// PATCH /api/courses/[id] - Update a course
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingCourse = await db.course.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const body = await request.json();
        const {
            name,
            platform,
            status,
            progress,
            nextLesson,
            targetCompletionDate,
            totalHours,
            completedHours,
            notes
        } = body;

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (name !== undefined) updateData.name = name;
        if (platform !== undefined) updateData.platform = platform;
        if (progress !== undefined) updateData.progress = progress;
        if (nextLesson !== undefined) updateData.nextLesson = nextLesson;
        if (notes !== undefined) updateData.notes = notes;
        if (targetCompletionDate !== undefined) {
            updateData.targetCompletionDate = targetCompletionDate ? new Date(targetCompletionDate) : null;
        }
        if (totalHours !== undefined) updateData.totalHours = parseFloat(totalHours) || null;
        if (completedHours !== undefined) updateData.completedHours = parseFloat(completedHours) || 0;

        if (status !== undefined) {
            updateData.status = status.toUpperCase().replace('-', '_') as CourseStatus;
        }

        const course = await db.course.update({
            where: { id },
            data: updateData,
        });

        // Log activity for completion or progress
        const newStatus = status?.toUpperCase().replace('-', '_');
        if (newStatus === 'COMPLETED' && existingCourse.status !== 'COMPLETED') {
            await db.activity.create({
                data: {
                    userId: user.id,
                    type: 'COURSE_COMPLETED',
                    action: 'completed',
                    title: course.name,
                    entityId: course.id,
                },
            });
        } else if (progress !== undefined && progress !== existingCourse.progress) {
            await db.activity.create({
                data: {
                    userId: user.id,
                    type: 'COURSE_PROGRESS',
                    action: 'progressed',
                    title: `${course.name} - ${progress}% complete`,
                    entityId: course.id,
                },
            });
        }

        const transformedCourse = {
            id: course.id,
            name: course.name,
            platform: course.platform,
            progress: course.progress,
            status: course.status.toLowerCase().replace('_', '-'),
            nextLesson: course.nextLesson,
            targetCompletionDate: course.targetCompletionDate?.toISOString().split('T')[0] ?? null,
            totalHours: course.totalHours ?? 0,
            completedHours: course.completedHours,
            notes: course.notes,
            thumbnail: course.thumbnail,
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
    }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingCourse = await db.course.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        await db.course.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
