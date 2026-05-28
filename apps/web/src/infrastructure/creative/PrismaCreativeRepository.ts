import type { PrismaClient } from '@prisma/client';
import { Creative } from '@nextface/domain';
import type { CreativeRepository } from '@nextface/application';
import type { CreativeFormat, CreativeFramework, HookType, CreativeStatus, CreativeAssets } from '@nextface/domain';

function toCreative(row: {
  id: string; orgId: string; productId: string; parentId: string | null;
  version: string; format: string; framework: string; hookType: string;
  angle: string; assets: unknown; seed: string; metadata: unknown;
  riskScore: unknown; status: string; createdAt: Date;
}): Creative {
  return Creative.reconstitute({
    id: row.id, orgId: row.orgId, productId: row.productId,
    parentId: row.parentId ?? undefined, version: row.version,
    format: row.format as CreativeFormat, framework: row.framework as CreativeFramework,
    hookType: row.hookType as HookType, angle: row.angle,
    assets: row.assets as CreativeAssets, seed: row.seed,
    metadata: row.metadata as Record<string, unknown>,
    riskScore: row.riskScore != null ? Number(row.riskScore) : undefined,
    status: row.status as CreativeStatus, createdAt: row.createdAt,
  });
}

export class PrismaCreativeRepository implements CreativeRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.creative.findUnique({ where: { id } });
    return row ? toCreative(row) : null;
  }

  async findByOrg(orgId: string, opts?: { status?: string; limit?: number; cursor?: string }) {
    const rows = await this.db.creative.findMany({
      where: { orgId, ...(opts?.status && { status: opts.status as never }) },
      take: opts?.limit ?? 50,
      ...(opts?.cursor && { cursor: { id: opts.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toCreative);
  }

  async findLineage(parentId: string) {
    const rows = await this.db.creative.findMany({ where: { parentId } });
    return rows.map(toCreative);
  }

  async save(creative: Creative) {
    const p = creative.toProps();
    await this.db.creative.create({
      data: {
        id: p.id, orgId: p.orgId, productId: p.productId,
        parentId: p.parentId ?? null, version: p.version,
        format: p.format, framework: p.framework, hookType: p.hookType,
        angle: p.angle, assets: p.assets, seed: p.seed, metadata: p.metadata,
        riskScore: p.riskScore, status: p.status,
      },
    });
  }

  async update(creative: Creative) {
    const p = creative.toProps();
    await this.db.creative.update({
      where: { id: p.id },
      data: { status: p.status, riskScore: p.riskScore, assets: p.assets, metadata: p.metadata },
    });
  }
}
