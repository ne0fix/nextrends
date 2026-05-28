import type { PrismaClient } from '@prisma/client';
import type { PublicationRepository, PublicationProps } from '@nextface/application';

export class PrismaPublicationRepository implements PublicationRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(pub: PublicationProps): Promise<void> {
    await this.db.publication.create({
      data: {
        id: pub.id,
        orgId: pub.orgId,
        creativeId: pub.creativeId,
        channel: pub.channel as never,
        externalId: pub.externalId,
        status: pub.status as never,
        scheduledAt: pub.scheduledAt,
        publishedAt: pub.publishedAt,
        url: pub.url,
        metadata: pub.metadata as never,
      },
    });
  }

  async findById(id: string): Promise<PublicationProps | null> {
    const row = await this.db.publication.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id, orgId: row.orgId, creativeId: row.creativeId,
      channel: row.channel, status: row.status,
      externalId: row.externalId ?? undefined,
      scheduledAt: row.scheduledAt ?? undefined,
      publishedAt: row.publishedAt ?? undefined,
      url: row.url ?? undefined,
      metadata: row.metadata as Record<string, unknown>,
    };
  }

  async updateStatus(id: string, status: string, externalId?: string): Promise<void> {
    await this.db.publication.update({
      where: { id },
      data: {
        status: status as never,
        ...(externalId && { externalId }),
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    });
  }
}
