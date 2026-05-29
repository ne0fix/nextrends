export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingYouTubeVideos } from '@/lib/youtubeApi';
import { mockViralVideos } from '@/lib/viralMockData';

export async function GET(_req: NextRequest) {
  try {
    if (process.env.YOUTUBE_API_KEY) {
      const videos = await fetchTrendingYouTubeVideos();
      if (videos.length > 0) {
        return NextResponse.json({ source: 'youtube', data: videos });
      }
    }
    return NextResponse.json({ source: 'mock', data: mockViralVideos });
  } catch (err) {
    console.error('[/api/v1/discovery/videos]', err);
    return NextResponse.json({ source: 'mock', data: mockViralVideos });
  }
}
