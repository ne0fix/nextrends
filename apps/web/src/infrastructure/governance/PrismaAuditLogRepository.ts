import type { PrismaClient } from '@prisma/client';
import type { AuditLogRepository, AuditLogEntry } from '@nextface/application';

export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly db: PrismaClient) {}

  async append(entry: AuditLogEntry) {
    await this.db.auditLog.create({ data: { ...entry } });
  }

  async findByOrg(orgId: string, opts?: { limit?: number; cursor?: string }) {
    const rows = await this.db.auditLog.findMany({
      where: { orgId },
      take: opts?.limit ?? 100,
      ...(opts?.cursor && { cursor: { id: opts.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
    });
    return rows as AuditLogEntry[];
  }
}
