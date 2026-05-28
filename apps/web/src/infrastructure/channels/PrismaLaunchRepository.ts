import type { PrismaClient } from '@prisma/client';
import type { LaunchRepository, LaunchData } from '@nextface/application';

export class PrismaLaunchRepository implements LaunchRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(launch: LaunchData): Promise<LaunchData> {
    const row = await this.db.launch.create({
      data: {
        id: launch.id,
        orgId: launch.orgId,
        productId: launch.productId,
        templateKey: launch.templateKey,
        startsAt: launch.startsAt,
        cartOpenAt: launch.cartOpenAt,
        cartCloseAt: launch.cartCloseAt,
        budgetCap: launch.budgetCap,
        status: launch.status as never,
        metrics: launch.metrics as never,
      },
    });
    return this.toData(row);
  }

  async findById(id: string): Promise<LaunchData | null> {
    const row = await this.db.launch.findUnique({ where: { id } });
    return row ? this.toData(row) : null;
  }

  async findByOrg(orgId: string): Promise<LaunchData[]> {
    const rows = await this.db.launch.findMany({ where: { orgId }, orderBy: { startsAt: 'desc' } });
    return rows.map(r => this.toData(r));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.launch.update({ where: { id }, data: { status: status as never } });
  }

  async updateMetrics(id: string, metrics: Record<string, unknown>): Promise<void> {
    await this.db.launch.update({ where: { id }, data: { metrics: metrics as never } });
  }

  private toData(row: { id: string; orgId: string; productId: string; templateKey: string; startsAt: Date; cartOpenAt: Date; cartCloseAt: Date; budgetCap: unknown; status: string; metrics: unknown }): LaunchData {
    return {
      id: row.id, orgId: row.orgId, productId: row.productId, templateKey: row.templateKey,
      startsAt: row.startsAt, cartOpenAt: row.cartOpenAt, cartCloseAt: row.cartCloseAt,
      budgetCap: Number(row.budgetCap), status: row.status,
      metrics: row.metrics as Record<string, unknown>,
    };
  }
}
