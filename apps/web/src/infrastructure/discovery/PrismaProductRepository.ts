import type { PrismaClient } from '@prisma/client';
import { Product } from '@nextface/domain';
import type { ProductRepository } from '@nextface/application';
import type { ProductSource, ProductDossier } from '@nextface/domain';

function toProduct(row: {
  id: string; source: string; externalId: string; name: string;
  niche: string; hotScore: unknown; dossier: unknown;
  saturation: number; blocked: boolean; updatedAt: Date;
}): Product {
  return Product.reconstitute({
    id: row.id, source: row.source as ProductSource, externalId: row.externalId,
    name: row.name, niche: row.niche, hotScore: Number(row.hotScore),
    dossier: row.dossier as ProductDossier, saturation: row.saturation,
    blocked: row.blocked, updatedAt: row.updatedAt,
  });
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async findTopByNiche(niche: string, limit = 10) {
    const rows = await this.db.product.findMany({
      where: { niche, blocked: false },
      orderBy: { hotScore: 'desc' },
      take: limit,
    });
    return rows.map(toProduct);
  }

  async findAll(opts?: { cursor?: string; limit?: number }) {
    const rows = await this.db.product.findMany({
      take: opts?.limit ?? 50,
      ...(opts?.cursor && { cursor: { id: opts.cursor }, skip: 1 }),
      orderBy: { hotScore: 'desc' },
    });
    return rows.map(toProduct);
  }

  async save(product: Product) {
    const p = product.toProps();
    await this.db.product.upsert({
      where: { source_externalId: { source: p.source, externalId: p.externalId } },
      create: { id: p.id, source: p.source, externalId: p.externalId, name: p.name, niche: p.niche, hotScore: p.hotScore, dossier: p.dossier, saturation: p.saturation, blocked: p.blocked },
      update: { name: p.name, hotScore: p.hotScore, dossier: p.dossier, saturation: p.saturation },
    });
  }

  async update(product: Product) {
    const p = product.toProps();
    await this.db.product.update({
      where: { id: p.id },
      data: { hotScore: p.hotScore, saturation: p.saturation, blocked: p.blocked, dossier: p.dossier },
    });
  }
}
