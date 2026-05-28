import type { PrismaClient } from '@prisma/client';
import type { MetricsRepository } from '@nextface/application';

export class PrismaMetricsRepository implements MetricsRepository {
  constructor(private readonly db: PrismaClient) {}

  async getAdMetrics(orgId: string, adId: string, days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await this.db.adMetric.findMany({
      where: { adId, date: { gte: since } },
      orderBy: { date: 'desc' },
    });

    if (rows.length === 0) {
      return { ctr: 0, roas: 0, frequency: 0, spend: 0, conversions: 0 };
    }

    const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
    const totalSpend = rows.reduce((s, r) => s + Number(r.spend), 0);
    const totalConversions = rows.reduce((s, r) => s + r.conversions, 0);
    const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
    const totalReach = rows.reduce((s, r) => s + r.reach, 0);

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const frequency = totalReach > 0 ? totalImpressions / totalReach : 0;

    return { ctr, roas, frequency, spend: totalSpend, conversions: totalConversions };
  }
}
