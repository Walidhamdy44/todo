import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string; lessonId: string }> }
) {
    try {
        const params = await props.params;

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { isCompleted } = body;

        // Verify ownership first
        const existingLesson = await db.lesson.findFirst({
            where: {
                id: params.lessonId,
                userId: user.id,
                courseId: params.id,
            },
        });

        if (!existingLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        const lesson = await db.lesson.update({
            where: {
                id: params.lessonId,
            },
            data: {
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
            },
        });

        // Update course progress
        const allLessons = await db.lesson.findMany({
            where: { courseId: params.id, userId: user.id },
            select: { isCompleted: true }
        });

        const completedCount = allLessons.filter((l: { isCompleted: boolean }) => l.isCompleted).length;
        const totalCount = allLessons.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        await db.course.update({
            where: { id: params.id, userId: user.id },
            data: { progress }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }
}
