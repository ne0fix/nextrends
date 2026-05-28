import type { AuditLogRepository } from '../../ports/AuditLogRepository.js';

export interface MetricsRepository {
  getAdMetrics(orgId: string, adId: string, days: number): Promise<{
    ctr: number;
    roas: number;
    frequency: number;
    spend: number;
    conversions: number;
    retention3s?: number;
    sends?: number;
  }>;
}

export interface OptimizerActionRepository {
  create(action: {
    orgId: string;
    type: string;
    targetType: string;
    targetId: string;
    payloadBefore: unknown;
    payloadAfter: unknown;
    reason: string;
    reversible: boolean;
  }): Promise<string>;
  execute(actionId: string): Promise<void>;
}

export interface CampaignRepository {
  findActiveByOrg(orgId: string): Promise<Array<{ id: string; ads: Array<{ id: string; creativeId: string }> }>>;
}

export type OodaDecision = {
  actionType: string;
  targetId: string;
  reason: string;
  reversible: boolean;
  payloadBefore: unknown;
  payloadAfter: unknown;
};

function decide(metrics: {
  ctr: number; roas: number; frequency: number; spend: number; retention3s?: number;
}): OodaDecision['actionType'] | null {
  if (metrics.ctr < 0.8 && metrics.spend > 50) return 'KILL';
  if (metrics.ctr > 1.5 && metrics.roas > 2.5 && metrics.frequency < 4.0) return 'SCALE';
  if (metrics.frequency > 4.0) return 'ROTATE';
  if ((metrics.retention3s ?? 100) < 50) return 'MUTATE';
  return null;
}

export class RunOodaLoopUseCase {
  constructor(
    private readonly campaigns: CampaignRepository,
    private readonly metrics: MetricsRepository,
    private readonly actions: OptimizerActionRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: { orgId: string; dryRun?: boolean }): Promise<{ actionsGenerated: number }> {
    const activeCampaigns = await this.campaigns.findActiveByOrg(input.orgId);
    let count = 0;

    for (const campaign of activeCampaigns) {
      for (const ad of campaign.ads) {
        const m = await this.metrics.getAdMetrics(input.orgId, ad.id, 7);
        const actionType = decide(m);
        if (!actionType) continue;

        const actionId = await this.actions.create({
          orgId: input.orgId,
          type: actionType,
          targetType: 'ad',
          targetId: ad.id,
          payloadBefore: m,
          payloadAfter: {},
          reason: `OODA: ${actionType} triggered by metrics (ctr=${m.ctr}, freq=${m.frequency})`,
          reversible: actionType !== 'KILL',
        });

        if (!input.dryRun) {
          await this.actions.execute(actionId);
        }

        await this.audit.append({
          orgId: input.orgId,
          actorType: 'ai',
          actorId: 'optimizer',
          action: `optimizer.${actionType.toLowerCase()}`,
          resourceType: 'Ad',
          resourceId: ad.id,
          reason: `OODA cycle`,
        });

        count++;
      }
    }

    return { actionsGenerated: count };
  }
}
