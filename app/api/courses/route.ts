import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { CourseStatus } from '@prisma/client';

// GET /api/courses - Get all courses for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const platform = searchParams.get('platform');

        const courses = await db.course.findMany({
            where: {
                userId: user.id,
                ...(status && { status: status.toUpperCase().replace('-', '_') as CourseStatus }),
                ...(platform && { platform }),
            },
            include: {
                _count: {
                    select: { lessons: true }
                },
                lessons: {
                    where: { isCompleted: true },
                    select: { id: true }
                }
            },
            orderBy: [
                { status: 'asc' },
                { progress: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // Transform to match frontend types
        const transformedCourses = courses.map((course) => ({
            id: course.id,
            name: course.name,
            platform: course.platform,
            progress: course.youtubeType === 'playlist'
                ? (course._count.lessons > 0 ? Math.round((course.lessons.length / course._count.lessons) * 100) : 0)
                : course.progress,
            status: course.status.toLowerCase().replace('_', '-') as 'not-started' | 'in-progress' | 'completed' | 'paused',
            nextLesson: course.nextLesson,
            targetCompletionDate: course.targetCompletionDate?.toISOString().split('T')[0] ?? null,
            totalHours: course.totalHours ?? 0,
            completedHours: course.completedHours,
            notes: course.notes,
            thumbnail: course.thumbnail,
            youtubeUrl: course.youtubeUrl,
            youtubeType: course.youtubeType,
            youtubeId: course.youtubeId,
            thumbnailUrl: course.thumbnailUrl,
            videoCount: course.videoCount,
            totalLessons: course._count.lessons,
            completedLessonsCount: course.lessons.length,
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformedCourses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            notes,
            // YouTube fields
            youtubeUrl,
            youtubeType,
            youtubeId,
            thumbnailUrl,
            videoCount
        } = body;

        if (!name || !platform) {
            return NextResponse.json({ error: 'Name and platform are required' }, { status: 400 });
        }

        // Map frontend status to Prisma enum
        const prismaStatus = status ?
            status.toUpperCase().replace('-', '_') as CourseStatus :
            'NOT_STARTED';

        // Create course
        const course = await db.course.create({
            data: {
                userId: user.id,
                name,
                platform,
                status: prismaStatus,
                progress: progress ?? 0,
                nextLesson,
                targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
                totalHours: totalHours ? parseFloat(totalHours) : null,
                completedHours: completedHours ?? 0,
                notes,
                youtubeUrl,
                youtubeType,
                youtubeId,
                thumbnailUrl,
                videoCount,
            },
        });

        // If it's a playlist, fetch and create lessons
        if (youtubeType === 'playlist' && youtubeId) {
            const { fetchPlaylistItems } = await import('@/lib/youtube');
            const playlistItems = await fetchPlaylistItems(youtubeId);

            if (playlistItems.length > 0) {
                await db.lesson.createMany({
                    data: playlistItems.map((item) => ({
                        courseId: course.id,
                        userId: user.id,
                        title: item.title,
                        youtubeVideoId: item.id,
                        thumbnailUrl: item.thumbnailUrl,
                        duration: item.duration,
                        orderIndex: item.position,
                    })),
                });
            }
        }

        // Log activity
        await db.activity.create({
            data: {
                userId: user.id,
                type: 'COURSE_STARTED',
                action: 'started',
                title: `${course.name} added to queue`,
                entityId: course.id,
            },
        });

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
            youtubeUrl: course.youtubeUrl,
            youtubeType: course.youtubeType,
            youtubeId: course.youtubeId,
            thumbnailUrl: course.thumbnailUrl,
            videoCount: course.videoCount,
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedCourse, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
}
