import { describe, it, expect, vi } from 'vitest';
import { ConnectMetaIntegrationUseCase } from './ConnectMetaIntegrationUseCase';
import type { MetaOAuthGateway, EncryptionService } from './ConnectMetaIntegrationUseCase';
import type { IntegrationRepository } from '../../ports/IntegrationRepository';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

function makeIntegrationRepo(): IntegrationRepository {
  const store = new Map<string, unknown>();
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByOrgAndProvider: vi.fn().mockResolvedValue(null),
    findAllByOrg: vi.fn().mockResolvedValue([]),
    findExpiringSoon: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockImplementation(async (i) => { store.set(i.id, i); }),
    updateStatus: vi.fn(),
    getEncryptedCredentials: vi.fn().mockResolvedValue(null),
    delete: vi.fn(),
  };
}

const mockOAuth: MetaOAuthGateway = {
  exchangeCode: vi.fn().mockResolvedValue({ accessToken: 'tok-123', scopes: ['public_profile'] }),
  fetchBusinessResources: vi.fn().mockResolvedValue({
    businessId: 'biz-1', adAccounts: ['act_111'], pages: ['pg-1'], instagramAccounts: [], pixelIds: [],
  }),
};

const mockEncryption: EncryptionService = {
  encrypt: vi.fn().mockResolvedValue(Buffer.from('encrypted')),
  decrypt: vi.fn().mockResolvedValue({ accessToken: 'tok-123' }),
};

const mockAudit: AuditLogRepository = {
  append: vi.fn(),
  findByOrg: vi.fn().mockResolvedValue([]),
};

describe('ConnectMetaIntegrationUseCase', () => {
  it('retorna integrationId e businessId', async () => {
    const uc = new ConnectMetaIntegrationUseCase(makeIntegrationRepo(), mockOAuth, mockEncryption, mockAudit);
    const result = await uc.execute({ orgId: 'org-1', actorId: 'user-1', code: 'auth-code', redirectUri: 'https://example.com/callback' });
    expect(result.integrationId).toBeTruthy();
    expect(result.businessId).toBe('biz-1');
    expect(result.adAccounts).toContain('act_111');
  });

  it('lança erro se orgId vazio', async () => {
    const uc = new ConnectMetaIntegrationUseCase(makeIntegrationRepo(), mockOAuth, mockEncryption, mockAudit);
    await expect(uc.execute({ orgId: '', actorId: 'u1', code: 'c', redirectUri: 'https://x.com' })).rejects.toThrow();
  });

  it('chama audit.append após conexão bem-sucedida', async () => {
    const audit = { append: vi.fn(), findByOrg: vi.fn().mockResolvedValue([]) };
    const uc = new ConnectMetaIntegrationUseCase(makeIntegrationRepo(), mockOAuth, mockEncryption, audit);
    await uc.execute({ orgId: 'org-1', actorId: 'user-1', code: 'code', redirectUri: 'https://x.com' });
    expect(audit.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'integration.connect' }));
  });
});
