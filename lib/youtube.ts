export interface YouTubeMetadata {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration?: number; // in seconds
    videoCount?: number;
    type: 'video' | 'playlist';
}

export interface YouTubePlaylistItem {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
    position: number;
}

const API_KEY = process.env.YOUTUBE_API_KEY;

export function parseYouTubeUrl(url: string): { id: string; type: 'video' | 'playlist' } | null {
    // Playlist patterns
    const playlistRegex = /[&?]list=([^&]+)/;
    const playlistMatch = url.match(playlistRegex);
    if (playlistMatch && playlistMatch[1]) {
        return { id: playlistMatch[1], type: 'playlist' };
    }

    // Video patterns
    const videoRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const videoMatch = url.match(videoRegex);
    if (videoMatch && videoMatch[1]) {
        return { id: videoMatch[1], type: 'video' };
    }

    return null;
}

function parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata | null> {
    const parsed = parseYouTubeUrl(url);
    if (!parsed || !API_KEY) return null;

    if (parsed.type === 'video') {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${parsed.id}&key=${API_KEY}`
        );
        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;

        const video = data.items[0];
        return {
            id: parsed.id,
            type: 'video',
            title: video.snippet.title,
            thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
            duration: parseDuration(video.contentDetails.duration),
        };
    } else {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${parsed.id}&key=${API_KEY}`
        );
        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;

        const playlist = data.items[0];
        return {
            id: parsed.id,
            type: 'playlist',
            title: playlist.snippet.title,
            thumbnailUrl: playlist.snippet.thumbnails.high?.url || playlist.snippet.thumbnails.default?.url,
            videoCount: playlist.contentDetails.itemCount,
        };
    }
}

export async function fetchPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
    if (!API_KEY) return [];

    let items: YouTubePlaylistItem[] = [];
    let nextPageToken = '';

    try {
        do {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
            );
            const data = await response.json();
            if (!data.items) break;

            const videoIds = data.items.map((item: any) => item.contentDetails.videoId).join(',');
            const videoResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`
            );
            const videoData = await videoResponse.json();
            const videoDurations = Object.fromEntries(
                videoData.items.map((v: any) => [v.id, parseDuration(v.contentDetails.duration)])
            );

            const mappedItems = data.items.map((item: any) => ({
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                duration: videoDurations[item.contentDetails.videoId] || 0,
                position: item.snippet.position,
            }));

            items = [...items, ...mappedItems];
            nextPageToken = data.nextPageToken;
        } while (nextPageToken);
    } catch (error) {
        console.error('Error fetching playlist items:', error);
    }

    return items;
}
