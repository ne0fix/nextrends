import type { PrismaClient } from '@prisma/client';
import type { ChannelRepository, ChannelData } from '@nextface/application';

export class PrismaChannelRepository implements ChannelRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(channel: ChannelData): Promise<ChannelData> {
    const row = await this.db.socialChannel.create({
      data: {
        id: channel.id,
        orgId: channel.orgId,
        provider: channel.provider as never,
        externalId: channel.externalId,
        handle: channel.handle,
        brandDna: channel.brandDna as never,
        status: channel.status as never,
        phase: channel.phase as never,
        followers: channel.followers,
      },
    });
    return this.toData(row);
  }

  async findById(id: string): Promise<ChannelData | null> {
    const row = await this.db.socialChannel.findUnique({ where: { id } });
    return row ? this.toData(row) : null;
  }

  async findByOrg(orgId: string): Promise<ChannelData[]> {
    const rows = await this.db.socialChannel.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.toData(r));
  }

  async updateStatus(id: string, status: string, phase?: string): Promise<void> {
    await this.db.socialChannel.update({
      where: { id },
      data: { status: status as never, ...(phase && { phase: phase as never }) },
    });
  }

  private toData(row: { id: string; orgId: string; provider: string; externalId: string | null; handle: string; brandDna: unknown; status: string; phase: string; followers: number }): ChannelData {
    return {
      id: row.id, orgId: row.orgId, provider: row.provider,
      externalId: row.externalId ?? undefined, handle: row.handle,
      brandDna: row.brandDna as Record<string, unknown>,
      status: row.status, phase: row.phase, followers: row.followers,
    };
  }
}
