import type { IntegrationRepository } from '../../ports/IntegrationRepository.js';
import type { AuditLogRepository } from '../../ports/AuditLogRepository.js';

export interface IntegrationHealthChecker {
  check(provider: string, credentials: Record<string, string>): Promise<{ ok: boolean; error?: string }>;
}

export interface EncryptionService {
  decrypt(buf: Buffer): Promise<Record<string, string>>;
}

export class HealthCheckIntegrationsUseCase {
  constructor(
    private readonly integrations: IntegrationRepository,
    private readonly checker: IntegrationHealthChecker,
    private readonly encryption: EncryptionService,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(orgId: string): Promise<void> {
    const all = await this.integrations.findAllByOrg(orgId);
    const now = new Date();

    await Promise.allSettled(
      all.filter(i => i.isUsable()).map(async (integration) => {
        const buf = await this.integrations.getEncryptedCredentials(integration.id);
        if (!buf) return;

        const creds = await this.encryption.decrypt(buf);
        const result = await this.checker.check(integration.provider, creds);

        const updated = result.ok
          ? integration.markHealthy(now)
          : integration.markDegraded(now);

        await this.integrations.updateStatus(integration.id, {
          lastHealthCheckAt: now,
          lastHealthOk: updated.lastHealthOk,
          status: updated.status,
        });

        if (!result.ok) {
          await this.audit.append({
            orgId,
            actorType: 'ai',
            actorId: 'system',
            action: 'integration.health_check_failed',
            resourceType: 'Integration',
            resourceId: integration.id,
            reason: result.error,
          });
        }
      }),
    );
  }
}
