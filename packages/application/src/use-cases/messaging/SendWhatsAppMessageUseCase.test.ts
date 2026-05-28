import { describe, it, expect, vi } from 'vitest';
import { SendWhatsAppMessageUseCase } from './SendWhatsAppMessageUseCase';
import { Integration } from '@nextface/domain';
import type { WhatsAppGateway } from './SendWhatsAppMessageUseCase';

const base = {
  id: 'int-1', orgId: 'org-1', provider: 'WHATSAPP' as const,
  externalAccountIds: [], scopes: [], lastHealthOk: true, createdAt: new Date(),
};

const connectedIntegration = Integration.reconstitute({ ...base, status: 'CONNECTED' });

function makeIntegrationRepo() {
  return {
    findById: vi.fn().mockResolvedValue(connectedIntegration),
    findByOrgAndProvider: vi.fn().mockResolvedValue(connectedIntegration),
    findAllByOrg: vi.fn().mockResolvedValue([]),
    findExpiringSoon: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    updateStatus: vi.fn(),
    getEncryptedCredentials: vi.fn().mockResolvedValue(Buffer.from('enc')),
    delete: vi.fn(),
  };
}

const mockEncryption = { decrypt: vi.fn().mockResolvedValue({ accessToken: 'tok', phoneNumberId: 'ph-1' }) };
const mockAudit = { append: vi.fn(), findByOrg: vi.fn().mockResolvedValue([]) };

describe('SendWhatsAppMessageUseCase', () => {
  it('envia mensagem de texto', async () => {
    const gateway: WhatsAppGateway = {
      sendTextMessage: vi.fn().mockResolvedValue({ messageId: 'msg-1' }),
      sendTemplateMessage: vi.fn(),
    };
    const uc = new SendWhatsAppMessageUseCase(makeIntegrationRepo(), gateway, mockEncryption, mockAudit);
    const result = await uc.execute({ orgId: 'org-1', actorId: 'u1', to: '5511999999999', type: 'text', body: 'Olá!' });
    expect(result.messageId).toBe('msg-1');
    expect(gateway.sendTextMessage).toHaveBeenCalledWith(expect.objectContaining({ to: '5511999999999', body: 'Olá!' }));
  });

  it('envia template', async () => {
    const gateway: WhatsAppGateway = {
      sendTextMessage: vi.fn(),
      sendTemplateMessage: vi.fn().mockResolvedValue({ messageId: 'msg-2' }),
    };
    const uc = new SendWhatsAppMessageUseCase(makeIntegrationRepo(), gateway, mockEncryption, mockAudit);
    const result = await uc.execute({ orgId: 'org-1', actorId: 'u1', to: '5511999999999', type: 'template', templateName: 'boas_vindas' });
    expect(result.messageId).toBe('msg-2');
    expect(gateway.sendTemplateMessage).toHaveBeenCalledWith(expect.objectContaining({ templateName: 'boas_vindas' }));
  });

  it('lança erro se integração não conectada', async () => {
    const repo = { ...makeIntegrationRepo(), findByOrgAndProvider: vi.fn().mockResolvedValue(null) };
    const gateway: WhatsAppGateway = { sendTextMessage: vi.fn(), sendTemplateMessage: vi.fn() };
    const uc = new SendWhatsAppMessageUseCase(repo, gateway, mockEncryption, mockAudit);
    await expect(uc.execute({ orgId: 'org-1', actorId: 'u1', to: '55119', type: 'text', body: 'Oi' })).rejects.toThrow('not connected');
  });
});
