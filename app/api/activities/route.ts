import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/activities - Get recent activities
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') ?? '10');

        const activities = await db.activity.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: Math.min(limit, 50), // Cap at 50
        });

        // Transform to match frontend types
        const transformedActivities = activities.map((activity: any) => ({
            id: activity.id,
            type: activity.type.toLowerCase().split('_')[0] as 'task' | 'course' | 'reading' | 'goal',
            action: activity.action,
            title: activity.title,
            timestamp: activity.createdAt.toISOString(),
        }));

        return NextResponse.json(transformedActivities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
