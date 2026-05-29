export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardView } from '@/views/dashboard/DashboardView';
import { mockViralVideos } from '@/lib/viralMockData';
import { fetchTrendingYouTubeVideos } from '@/lib/youtubeApi';

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';

  const [creativesCount, integrationsCount, campaignsCount, viralResult] = await Promise.all([
    prisma.creative.count({ where: { orgId } }),
    prisma.integration.count({ where: { orgId, status: 'CONNECTED' } }),
    prisma.campaign.count({ where: { orgId, status: 'ACTIVE' } }),
    process.env.YOUTUBE_API_KEY
      ? fetchTrendingYouTubeVideos().then(v => ({ data: v, source: 'youtube' })).catch(() => ({ data: mockViralVideos, source: 'mock' }))
      : Promise.resolve({ data: mockViralVideos, source: 'mock' }),
  ]);

  return (
    <DashboardView
      stats={{ creatives: creativesCount, integrations: integrationsCount, campaigns: campaignsCount }}
      viralVideos={viralResult.data.slice(0, 10)}
      viralSource={viralResult.source}
    />
  );
}
