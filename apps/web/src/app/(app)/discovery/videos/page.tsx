export const dynamic = 'force-dynamic';
import { ViralVideosView } from '@/views/discovery/ViralVideosView';
import { fetchTrendingYouTubeVideos } from '@/lib/youtubeApi';
import { mockViralVideos } from '@/lib/viralMockData';

export default async function ViralVideosPage() {
  const result = process.env.YOUTUBE_API_KEY
    ? await fetchTrendingYouTubeVideos()
        .then(v => ({ data: v, source: 'youtube' }))
        .catch(() => ({ data: mockViralVideos, source: 'mock' }))
    : { data: mockViralVideos, source: 'mock' };

  return (
    <ViralVideosView
      initialVideos={result.data}
      initialSource={result.source}
    />
  );
}
