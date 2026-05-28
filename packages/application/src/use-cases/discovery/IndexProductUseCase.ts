import { Product, type ProductDossier, type ProductSource } from '@nextface/domain';
import type { ProductRepository } from '../../ports/ProductRepository';
import type { AiGenerationGateway } from '../../ports/AiGenerationGateway';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface IndexProductInput {
  orgId: string;
  actorId: string;
  source: ProductSource;
  externalId: string;
  name: string;
  niche: string;
  rawData: Record<string, unknown>;
  saturation?: number;
}

export interface IndexProductOutput {
  productId: string;
  hotScore: number;
  isNew: boolean;
}

export class IndexProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly ai: AiGenerationGateway,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: IndexProductInput): Promise<IndexProductOutput> {
    const existing = await this.products.findByExternalId(input.source, input.externalId);

    const { dossier } = await this.ai.generateProductDossier(input.rawData);
    const { score } = await this.ai.computeHotScore({ name: input.name, niche: input.niche, ...input.rawData });

    if (existing) {
      const updated = existing.updateHotScore(score);
      await this.products.update(updated);
      await this.audit.append({
        orgId: input.orgId,
        actorType: 'ai',
        actorId: input.actorId,
        action: 'product.reindexed',
        resourceType: 'Product',
        resourceId: existing.id,
        after: { hotScore: score },
      });
      return { productId: existing.id, hotScore: score, isNew: false };
    }

    const product = Product.create({
      id: crypto.randomUUID(),
      source: input.source,
      externalId: input.externalId,
      name: input.name,
      niche: input.niche,
      dossier: dossier as unknown as ProductDossier,
      saturation: input.saturation ?? 0,
    });

    const withScore = product.updateHotScore(score);
    await this.products.save(withScore);

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'ai',
      actorId: input.actorId,
      action: 'product.indexed',
      resourceType: 'Product',
      resourceId: withScore.id,
      after: { hotScore: score, source: input.source },
    });

    return { productId: withScore.id, hotScore: score, isNew: true };
  }
}
