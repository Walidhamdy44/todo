import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lessons = await db.lesson.findMany({
            where: {
                courseId: params.id,
                userId: user.id,
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}
