import { Integration } from '@nextface/domain';
import type { IntegrationRepository } from '../../ports/IntegrationRepository.js';
import type { AuditLogRepository } from '../../ports/AuditLogRepository.js';

export interface MetaOAuthGateway {
  exchangeCode(code: string, redirectUri: string): Promise<{
    accessToken: string;
    expiresAt?: Date;
    scopes: string[];
  }>;
  fetchBusinessResources(accessToken: string): Promise<{
    businessId: string;
    adAccounts: string[];
    pages: string[];
    instagramAccounts: string[];
    pixelIds: string[];
  }>;
}

export interface EncryptionService {
  encrypt(data: Record<string, string>): Promise<Buffer>;
  decrypt(buf: Buffer): Promise<Record<string, string>>;
}

export interface ConnectMetaInput {
  orgId: string;
  actorId: string;
  code: string;
  redirectUri: string;
}

export interface ConnectMetaOutput {
  integrationId: string;
  businessId: string;
  adAccounts: string[];
  pages: string[];
}

export class ConnectMetaIntegrationUseCase {
  constructor(
    private readonly integrations: IntegrationRepository,
    private readonly metaOauth: MetaOAuthGateway,
    private readonly encryption: EncryptionService,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: ConnectMetaInput): Promise<ConnectMetaOutput> {
    const tokenResult = await this.metaOauth.exchangeCode(input.code, input.redirectUri);
    const resources = await this.metaOauth.fetchBusinessResources(tokenResult.accessToken);

    const existing = await this.integrations.findByOrgAndProvider(input.orgId, 'META');
    if (existing) await this.integrations.updateStatus(existing.id, { status: 'REVOKED' });

    const integration = Integration.create({
      id: crypto.randomUUID(),
      orgId: input.orgId,
      provider: 'META',
      externalAccountIds: [
        resources.businessId,
        ...resources.adAccounts,
        ...resources.pages,
        ...resources.instagramAccounts,
      ],
      scopes: tokenResult.scopes,
      expiresAt: tokenResult.expiresAt,
    });

    const encryptedCreds = await this.encryption.encrypt({
      accessToken: tokenResult.accessToken,
      businessId: resources.businessId,
    });

    await this.integrations.save(integration, encryptedCreds);
    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'integration.connect',
      resourceType: 'Integration',
      resourceId: integration.id,
      after: { provider: 'META', status: 'CONNECTED' },
    });

    return {
      integrationId: integration.id,
      businessId: resources.businessId,
      adAccounts: resources.adAccounts,
      pages: resources.pages,
    };
  }
}
