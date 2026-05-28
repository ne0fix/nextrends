import { Creative, NotFoundError, ForbiddenError } from '@nextface/domain';
import type { CreativeRepository } from '../../ports/CreativeRepository';
import type { AiGenerationGateway } from '../../ports/AiGenerationGateway';
import type { ComplianceCheckerGateway } from '../../ports/ComplianceCheckerGateway';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface MutateCreativeInput {
  orgId: string;
  actorId: string;
  parentCreativeId: string;
  angle?: string;
  hookType?: string;
  framework?: string;
}

export interface MutateCreativeOutput {
  creativeId: string;
}

export class MutateCreativeUseCase {
  constructor(
    private readonly creatives: CreativeRepository,
    private readonly ai: AiGenerationGateway,
    private readonly compliance: ComplianceCheckerGateway,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: MutateCreativeInput): Promise<MutateCreativeOutput> {
    const parent = await this.creatives.findById(input.parentCreativeId);
    if (!parent) throw new NotFoundError('Creative', input.parentCreativeId);
    if (parent.orgId !== input.orgId) throw new ForbiddenError('creative belongs to different org');

    const framework = (input.framework ?? parent.framework) as typeof parent.framework;
    const hookType = (input.hookType ?? parent.hookType) as typeof parent.hookType;
    const angle = input.angle ?? parent.angle;

    const [majorVersion] = parent.version.split('.');
    const newVersion = `${majorVersion}.${Date.now()}`;

    const { assets, seed, tokensUsed } = await this.ai.generateCreativeAssets({
      productDossier: parent.metadata as Record<string, unknown>,
      format: parent.format,
      framework,
      hookType,
      angle,
      channel: String(parent.metadata.channel ?? 'META_FEED'),
    });

    const mutation = Creative.create({
      id: crypto.randomUUID(),
      orgId: parent.orgId,
      productId: parent.productId,
      parentId: parent.id,
      version: newVersion,
      format: parent.format,
      framework,
      hookType,
      angle,
      assets,
      seed,
      metadata: { ...parent.metadata, tokensUsed, mutatedFrom: parent.id },
    });

    const { riskScore } = await this.compliance.check(assets, String(parent.metadata.channel ?? 'META_FEED'));
    const withRisk = mutation.withRiskScore(riskScore);

    await this.creatives.save(withRisk);
    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'creative.mutated',
      resourceType: 'Creative',
      resourceId: withRisk.id,
      after: { parentId: parent.id, angle, hookType, framework },
    });

    return { creativeId: withRisk.id };
  }
}
