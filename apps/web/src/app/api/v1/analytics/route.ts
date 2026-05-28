export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = session.user.orgId;
  const days = Number(req.nextUrl.searchParams.get('days') ?? 7);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [metrics, topCreatives, recentActions, campaignStats] = await Promise.all([
    prisma.adMetric.aggregate({
      where: { ad: { adSet: { campaign: { orgId } } }, date: { gte: since } },
      _sum: { spend: true, impressions: true, clicks: true, conversions: true, revenue: true },
    }),
    prisma.creative.findMany({
      where: { orgId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, angle: true, hookType: true, format: true, riskScore: true, createdAt: true },
    }),
    prisma.optimizerAction.findMany({
      where: { orgId, executedAt: { gte: since } },
      orderBy: { executedAt: 'desc' },
      take: 10,
      select: { id: true, type: true, targetType: true, reason: true, executedAt: true },
    }),
    prisma.campaign.groupBy({
      by: ['status'],
      where: { orgId },
      _count: true,
    }),
  ]);

  const spend = Number(metrics._sum.spend ?? 0);
  const revenue = Number(metrics._sum.revenue ?? 0);
  const impressions = metrics._sum.impressions ?? 0;
  const clicks = metrics._sum.clicks ?? 0;
  const conversions = metrics._sum.conversions ?? 0;

  return NextResponse.json({
    period: { days, since },
    summary: {
      spend,
      revenue,
      roas: spend > 0 ? revenue / spend : 0,
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      conversions,
      cpa: conversions > 0 ? spend / conversions : 0,
    },
    topCreatives,
    recentActions,
    campaignStats: campaignStats.map(s => ({ status: s.status, count: s._count })),
  });
}
