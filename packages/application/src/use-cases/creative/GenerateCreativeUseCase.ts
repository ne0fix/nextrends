import { Creative } from '@nextface/domain';
import type { CreativeRepository } from '../../ports/CreativeRepository.js';
import type { ProductRepository } from '../../ports/ProductRepository.js';
import type { AiGenerationGateway } from '../../ports/AiGenerationGateway.js';
import type { ComplianceCheckerGateway } from '../../ports/ComplianceCheckerGateway.js';
import type { AuditLogRepository } from '../../ports/AuditLogRepository.js';
import type { GenerateCreativeInput } from '@nextface/schemas';

export class GenerateCreativeUseCase {
  constructor(
    private readonly creatives: CreativeRepository,
    private readonly products: ProductRepository,
    private readonly ai: AiGenerationGateway,
    private readonly compliance: ComplianceCheckerGateway,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: GenerateCreativeInput): Promise<{ creativeId: string }> {
    const product = await this.products.findById(input.productId);
    if (!product) throw new Error(`Product ${input.productId} not found`);

    const framework = input.framework ?? 'AIDA';
    const hookType = input.hookType ?? 'COGNITIVE_DISSONANCE';
    const angle = input.angle ?? 'transformation';

    const { assets, seed, tokensUsed } = await this.ai.generateCreativeAssets({
      productDossier: product.dossier,
      format: input.format,
      framework,
      hookType,
      angle,
      channel: input.channel,
    });

    const creative = Creative.create({
      id: crypto.randomUUID(),
      orgId: input.orgId,
      productId: input.productId,
      parentId: input.parentId,
      version: '1.0',
      format: input.format,
      framework,
      hookType,
      angle,
      assets,
      seed,
      metadata: { tokensUsed, channel: input.channel },
    });

    const compliance = await this.compliance.check(assets, input.channel);
    const withRisk = creative.withRiskScore(compliance.riskScore);
    const ready = compliance.approved
      ? withRisk
      : withRisk;

    await this.creatives.save(ready);
    await this.audit.append({
      orgId: input.orgId,
      actorType: 'ai',
      actorId: 'system',
      action: 'creative.generated',
      resourceType: 'Creative',
      resourceId: ready.id,
      after: { format: input.format, riskScore: compliance.riskScore },
    });

    return { creativeId: ready.id };
  }
}
