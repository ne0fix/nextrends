import type { PrismaClient } from '@prisma/client';
import type { CampaignRepository } from '@nextface/application';

export class PrismaCampaignRepository implements CampaignRepository {
  constructor(private readonly db: PrismaClient) {}

  async findActiveByOrg(orgId: string) {
    const campaigns = await this.db.campaign.findMany({
      where: { orgId, status: 'ACTIVE' },
      include: {
        adSets: {
          include: {
            ads: { select: { id: true, creativeId: true, status: true } },
          },
        },
      },
    });

    return campaigns.map(c => ({
      id: c.id,
      ads: c.adSets.flatMap(s => s.ads.map(a => ({ id: a.id, creativeId: a.creativeId }))),
    }));
  }
}
