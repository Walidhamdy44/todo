import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/reading/[id] - Get a single reading item
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const item = await db.readingItem.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!item) {
            return NextResponse.json({ error: 'Reading item not found' }, { status: 404 });
        }

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

        return NextResponse.json(transformedItem);
    } catch (error) {
        console.error('Error fetching reading item:', error);
        return NextResponse.json({ error: 'Failed to fetch reading item' }, { status: 500 });
    }
}

// PATCH /api/reading/[id] - Update a reading item
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingItem = await db.readingItem.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingItem) {
            return NextResponse.json({ error: 'Reading item not found' }, { status: 404 });
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

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (title !== undefined) updateData.title = title;
        if (source !== undefined) updateData.source = source;
        if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;
        if (notes !== undefined) updateData.notes = notes;
        if (estimatedReadingTime !== undefined) {
            updateData.estimatedReadingTime = parseInt(estimatedReadingTime) || null;
        }
        if (tags !== undefined) {
            updateData.tags = typeof tags === 'string'
                ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : tags;
        }

        if (category !== undefined) {
            updateData.category = category.toUpperCase().replace('-', '_') as any;
        }
        if (priority !== undefined) {
            updateData.priority = priority.toUpperCase() as any;
        }
        if (status !== undefined) {
            updateData.status = status.toUpperCase().replace('-', '_') as any;
        }

        const item = await db.readingItem.update({
            where: { id },
            data: updateData,
        });

        // Log activity for completion
        const newStatus = status?.toUpperCase().replace('-', '_');
        if (newStatus === 'COMPLETED' && existingItem.status !== 'COMPLETED') {
            await db.activity.create({
                data: {
                    userId: user.id,
                    type: 'READING_COMPLETED',
                    action: 'completed',
                    title: item.title,
                    entityId: item.id,
                },
            });
        }

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

        return NextResponse.json(transformedItem);
    } catch (error) {
        console.error('Error updating reading item:', error);
        return NextResponse.json({ error: 'Failed to update reading item' }, { status: 500 });
    }
}

// DELETE /api/reading/[id] - Delete a reading item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existingItem = await db.readingItem.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingItem) {
            return NextResponse.json({ error: 'Reading item not found' }, { status: 404 });
        }

        await db.readingItem.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reading item:', error);
        return NextResponse.json({ error: 'Failed to delete reading item' }, { status: 500 });
    }
}
