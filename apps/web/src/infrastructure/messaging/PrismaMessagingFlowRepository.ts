import type { PrismaClient } from '@prisma/client';
import type { MessagingFlowRepository, FlowData, FlowStep } from '@nextface/application';

export class PrismaMessagingFlowRepository implements MessagingFlowRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(flow: FlowData): Promise<FlowData> {
    const row = await this.db.messagingFlow.create({
      data: {
        id: flow.id,
        orgId: flow.orgId,
        provider: flow.provider as never,
        name: flow.name,
        steps: flow.steps as never,
        metrics: flow.metrics as never,
      },
    });
    return this.toData(row);
  }

  async findById(id: string): Promise<FlowData | null> {
    const row = await this.db.messagingFlow.findUnique({ where: { id } });
    return row ? this.toData(row) : null;
  }

  async findByOrg(orgId: string): Promise<FlowData[]> {
    const rows = await this.db.messagingFlow.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.toData(r));
  }

  async update(flow: FlowData): Promise<void> {
    await this.db.messagingFlow.update({
      where: { id: flow.id },
      data: { name: flow.name, steps: flow.steps as never, metrics: flow.metrics as never },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.messagingFlow.delete({ where: { id } });
  }

  private toData(row: { id: string; orgId: string; provider: string; name: string; steps: unknown; metrics: unknown }): FlowData {
    return {
      id: row.id, orgId: row.orgId, provider: row.provider, name: row.name,
      steps: row.steps as FlowStep[], metrics: row.metrics as Record<string, unknown>,
    };
  }
}
