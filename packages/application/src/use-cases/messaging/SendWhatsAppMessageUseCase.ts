import type { IntegrationRepository } from '../../ports/IntegrationRepository';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface WhatsAppGateway {
  sendTextMessage(params: {
    phoneNumberId: string;
    to: string;
    body: string;
    accessToken: string;
  }): Promise<{ messageId: string }>;

  sendTemplateMessage(params: {
    phoneNumberId: string;
    to: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
    accessToken: string;
  }): Promise<{ messageId: string }>;
}

export interface EncryptionService {
  decrypt(buf: Buffer): Promise<Record<string, string>>;
}

export interface SendWhatsAppInput {
  orgId: string;
  actorId: string;
  to: string;
  type: 'text' | 'template';
  body?: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: unknown[];
}

export class SendWhatsAppMessageUseCase {
  constructor(
    private readonly integrations: IntegrationRepository,
    private readonly whatsapp: WhatsAppGateway,
    private readonly encryption: EncryptionService,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: SendWhatsAppInput): Promise<{ messageId: string }> {
    const integration = await this.integrations.findByOrgAndProvider(input.orgId, 'WHATSAPP' as never);
    if (!integration?.isUsable()) throw new Error('WhatsApp integration not connected');

    const buf = await this.integrations.getEncryptedCredentials(integration.id);
    if (!buf) throw new Error('WhatsApp credentials not found');
    const creds = await this.encryption.decrypt(buf);

    let result: { messageId: string };

    if (input.type === 'template') {
      if (!input.templateName) throw new Error('templateName required for template messages');
      result = await this.whatsapp.sendTemplateMessage({
        phoneNumberId: creds.phoneNumberId,
        to: input.to,
        templateName: input.templateName,
        languageCode: input.templateLanguage ?? 'pt_BR',
        components: input.templateComponents,
        accessToken: creds.accessToken,
      });
    } else {
      if (!input.body) throw new Error('body required for text messages');
      result = await this.whatsapp.sendTextMessage({
        phoneNumberId: creds.phoneNumberId,
        to: input.to,
        body: input.body,
        accessToken: creds.accessToken,
      });
    }

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'whatsapp.message_sent',
      resourceType: 'Message',
      after: { to: input.to, type: input.type, messageId: result.messageId },
    });

    return result;
  }
}
