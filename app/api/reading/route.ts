import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ReadingCategory, ReadingStatus, Priority } from '@prisma/client';

// GET /api/reading - Get all reading items for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        const items = await db.readingItem.findMany({
            where: {
                userId: user.id,
                ...(status && { status: status.toUpperCase().replace('-', '_') as ReadingStatus }),
                ...(category && { category: category.toUpperCase().replace('-', '_') as ReadingCategory }),
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // Transform to match frontend types
        const transformedItems = items.map((item: any) => ({
            id: item.id,
            title: item.title,
            source: item.source,
            sourceUrl: item.sourceUrl,
            category: item.category.toLowerCase().replace('_', '-') as 'technical' | 'business' | 'personal-development',
            priority: item.priority.toLowerCase() as 'high' | 'medium' | 'low',
            status: item.status.toLowerCase().replace('_', '-') as 'to-read' | 'reading' | 'completed',
            estimatedReadingTime: item.estimatedReadingTime ?? 0,
            tags: item.tags,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformedItems);
    } catch (error) {
        console.error('Error fetching reading items:', error);
        return NextResponse.json({ error: 'Failed to fetch reading items' }, { status: 500 });
    }
}

// POST /api/reading - Create a new reading item
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            source,
            sourceUrl,
            category,
            priority,
            status,
            estimatedReadingTime,
            tags,
            notes
        } = body;

        if (!title || !source) {
            return NextResponse.json({ error: 'Title and source are required' }, { status: 400 });
        }

        // Map frontend values to Prisma enums
        const prismaCategory = category ?
            category.toUpperCase().replace('-', '_') as ReadingCategory :
            'TECHNICAL';
        const prismaPriority = priority?.toUpperCase() as Priority || 'MEDIUM';
        const prismaStatus = status ?
            status.toUpperCase().replace('-', '_') as ReadingStatus :
            'TO_READ';

        // Parse tags if it's a string
        const parsedTags = typeof tags === 'string'
            ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : (tags ?? []);

        const item = await db.readingItem.create({
            data: {
                userId: user.id,
                title,
                source,
                sourceUrl,
                category: prismaCategory,
                priority: prismaPriority,
                status: prismaStatus,
                estimatedReadingTime: estimatedReadingTime ? parseInt(estimatedReadingTime) : null,
                tags: parsedTags,
                notes,
            },
        });

        // Log activity
        await db.activity.create({
            data: {
                userId: user.id,
                type: 'READING_ADDED',
                action: 'added',
                title: item.title,
                entityId: item.id,
            },
        });

        const transformedItem = {
            id: item.id,
            title: item.title,
            source: item.source,
            sourceUrl: item.sourceUrl,
            category: item.category.toLowerCase().replace('_', '-'),
            priority: item.priority.toLowerCase(),
            status: item.status.toLowerCase().replace('_', '-'),
            estimatedReadingTime: item.estimatedReadingTime ?? 0,
            tags: item.tags,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedItem, { status: 201 });
    } catch (error) {
        console.error('Error creating reading item:', error);
        return NextResponse.json({ error: 'Failed to create reading item' }, { status: 500 });
    }
}
