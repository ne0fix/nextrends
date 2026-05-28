import type { PrismaClient } from '@prisma/client';
import { Integration } from '@nextface/domain';
import type { IntegrationRepository } from '@nextface/application';
import type { Provider } from '@nextface/domain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IntegrationRow = any;

export class PrismaIntegrationRepository implements IntegrationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.integration.findUnique({ where: { id } });
    if (!row) return null;
    return Integration.reconstitute({
      id: row.id,
      orgId: row.orgId,
      provider: row.provider as Provider,
      status: row.status as Integration['status'],
      externalAccountIds: row.externalAccountIds,
      scopes: row.scopes,
      expiresAt: row.expiresAt ?? undefined,
      lastHealthCheckAt: row.lastHealthCheckAt ?? undefined,
      lastHealthOk: row.lastHealthOk,
      createdAt: row.createdAt,
    });
  }

  async findByOrgAndProvider(orgId: string, provider: Provider) {
    const row = await this.db.integration.findUnique({ where: { orgId_provider: { orgId, provider } } });
    if (!row) return null;
    return Integration.reconstitute({
      id: row.id, orgId: row.orgId, provider: row.provider as Provider,
      status: row.status as Integration['status'], externalAccountIds: row.externalAccountIds,
      scopes: row.scopes, expiresAt: row.expiresAt ?? undefined,
      lastHealthCheckAt: row.lastHealthCheckAt ?? undefined,
      lastHealthOk: row.lastHealthOk, createdAt: row.createdAt,
    });
  }

  async findAllByOrg(orgId: string) {
    const rows = await this.db.integration.findMany({ where: { orgId } });
    return rows.map((row: IntegrationRow) => Integration.reconstitute({
      id: row.id, orgId: row.orgId, provider: row.provider as Provider,
      status: row.status as Integration['status'], externalAccountIds: row.externalAccountIds,
      scopes: row.scopes, expiresAt: row.expiresAt ?? undefined,
      lastHealthCheckAt: row.lastHealthCheckAt ?? undefined,
      lastHealthOk: row.lastHealthOk, createdAt: row.createdAt,
    }));
  }

  async findExpiringSoon() {
    const threshold = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const rows = await this.db.integration.findMany({
      where: { expiresAt: { lte: threshold }, status: { not: 'REVOKED' } },
    });
    return rows.map((row: IntegrationRow) => Integration.reconstitute({
      id: row.id, orgId: row.orgId, provider: row.provider as Provider,
      status: row.status as Integration['status'], externalAccountIds: row.externalAccountIds,
      scopes: row.scopes, expiresAt: row.expiresAt ?? undefined,
      lastHealthCheckAt: row.lastHealthCheckAt ?? undefined,
      lastHealthOk: row.lastHealthOk, createdAt: row.createdAt,
    }));
  }

  async save(integration: Integration, encryptedCredentials: Buffer) {
    const p = integration.toProps();
    await this.db.integration.upsert({
      where: { orgId_provider: { orgId: p.orgId, provider: p.provider } },
      create: {
        id: p.id, orgId: p.orgId, provider: p.provider, status: p.status,
        externalAccountIds: p.externalAccountIds, encryptedCredentials: new Uint8Array(encryptedCredentials),
        scopes: p.scopes, expiresAt: p.expiresAt,
        lastHealthOk: p.lastHealthOk,
      },
      update: {
        status: p.status, externalAccountIds: p.externalAccountIds,
        encryptedCredentials: new Uint8Array(encryptedCredentials), scopes: p.scopes, expiresAt: p.expiresAt,
        lastHealthOk: p.lastHealthOk,
      },
    });
  }

  async updateStatus(id: string, props: Record<string, unknown>) {
    await this.db.integration.update({ where: { id }, data: props as never });
  }

  async getEncryptedCredentials(id: string) {
    const row = await this.db.integration.findUnique({ where: { id }, select: { encryptedCredentials: true } });
    return row ? Buffer.from(row.encryptedCredentials as Uint8Array) : null;
  }

  async delete(id: string) {
    await this.db.integration.delete({ where: { id } });
  }
}
