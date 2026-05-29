import type { AuditLogRepository } from '../../ports/AuditLogRepository';
import type { AiGenerationGateway } from '../../ports/AiGenerationGateway';

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

const CLASSIFICATION_TO_ACTION: Record<string, string | null> = {
  LOSER: 'KILL',
  FATIGUED: 'ROTATE',
  WINNER: 'SCALE',
  PROMISING: null,
  STABLE: null,
};

function decideFallback(metrics: {
  ctr: number; roas: number; frequency: number; spend: number; retention3s?: number;
}): string | null {
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
    private readonly ai?: AiGenerationGateway,
  ) {}

  private async decideAction(
    metrics: { ctr: number; roas: number; frequency: number; spend: number; conversions: number; retention3s?: number },
    adId: string,
    creativeId: string,
  ): Promise<{ actionType: string | null; reason: string }> {
    if (this.ai) {
      try {
        const result = await this.ai.classifyCreative({ ...metrics, adId, creativeId });
        const actionType = CLASSIFICATION_TO_ACTION[result.classification] ?? null;
        return {
          actionType,
          reason: `OODA/AI: ${result.classification} (conf=${result.confidence}) — ${result.explanation}`,
        };
      } catch {
        // fallback para regras se IA falhar
      }
    }
    const actionType = decideFallback(metrics);
    return {
      actionType,
      reason: `OODA: ${actionType} triggered by metrics (ctr=${metrics.ctr}, freq=${metrics.frequency})`,
    };
  }

  async execute(input: { orgId: string; dryRun?: boolean }): Promise<{ actionsGenerated: number }> {
    const activeCampaigns = await this.campaigns.findActiveByOrg(input.orgId);
    let count = 0;

    for (const campaign of activeCampaigns) {
      for (const ad of campaign.ads) {
        const m = await this.metrics.getAdMetrics(input.orgId, ad.id, 7);
        const { actionType, reason } = await this.decideAction(m, ad.id, ad.creativeId);
        if (!actionType) continue;

        const actionId = await this.actions.create({
          orgId: input.orgId,
          type: actionType,
          targetType: 'ad',
          targetId: ad.id,
          payloadBefore: m,
          payloadAfter: {},
          reason,
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
