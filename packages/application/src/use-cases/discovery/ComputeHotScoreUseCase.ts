import type { ProductRepository } from '../../ports/ProductRepository';
import type { AiGenerationGateway } from '../../ports/AiGenerationGateway';

export interface ComputeHotScoreInput {
  orgId: string;
  productIds?: string[];
}

export interface ComputeHotScoreOutput {
  updated: number;
  failed: number;
}

export class ComputeHotScoreUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly ai: AiGenerationGateway,
  ) {}

  async execute(input: ComputeHotScoreInput): Promise<ComputeHotScoreOutput> {
    const all = await this.products.findAll({ limit: 500 });
    const targets = input.productIds?.length
      ? all.filter(p => input.productIds!.includes(p.id))
      : all;

    let updated = 0;
    let failed = 0;

    await Promise.allSettled(
      targets.map(async (product) => {
        try {
          const { score } = await this.ai.computeHotScore({
            name: product.name,
            niche: product.niche,
            ...product.dossier,
          });
          const upd = product.updateHotScore(score);
          await this.products.update(upd);
          updated++;
        } catch {
          failed++;
        }
      }),
    );

    return { updated, failed };
  }
}
