import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fetchYouTubeMetadata } from '@/lib/youtube';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const metadata = await fetchYouTubeMetadata(url);
        if (!metadata) {
            return NextResponse.json({ error: 'Invalid YouTube URL or video/playlist not found' }, { status: 404 });
        }

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('[YOUTUBE_VALIDATE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
