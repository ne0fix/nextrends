import type { PrismaClient } from '@prisma/client';
import type { OptimizerActionRepository } from '@nextface/application';

export class PrismaOptimizerActionRepository implements OptimizerActionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(action: {
    orgId: string; type: string; targetType: string; targetId: string;
    payloadBefore: unknown; payloadAfter: unknown; reason: string; reversible: boolean;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.optimizerAction.create({
      data: {
        id,
        orgId: action.orgId,
        type: action.type as never,
        targetType: action.targetType,
        targetId: action.targetId,
        payloadBefore: action.payloadBefore as never,
        payloadAfter: action.payloadAfter as never,
        reason: action.reason,
        reversible: action.reversible,
      },
    });
    return id;
  }

  async execute(actionId: string): Promise<void> {
    const action = await this.db.optimizerAction.findUnique({ where: { id: actionId } });
    if (!action) return;

    if (action.type === 'KILL') {
      await this.db.ad.update({ where: { id: action.targetId }, data: { status: 'PAUSED' } }).catch(() => null);
    } else if (action.type === 'SCALE') {
      const ad = await this.db.ad.findUnique({ where: { id: action.targetId }, include: { adSet: { include: { campaign: true } } } }).catch(() => null);
      if (ad?.adSet.campaign) {
        const current = Number(ad.adSet.campaign.budgetDaily);
        await this.db.campaign.update({
          where: { id: ad.adSet.campaignId },
          data: { budgetDaily: current * 1.5 },
        }).catch(() => null);
      }
    }

    await this.db.optimizerAction.update({ where: { id: actionId }, data: { executedAt: new Date() } });
  }
}
