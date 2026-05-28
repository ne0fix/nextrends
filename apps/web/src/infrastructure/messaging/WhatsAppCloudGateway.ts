import type { WhatsAppGateway } from '@nextface/application';
import { env } from '../../lib/env';

export class WhatsAppCloudGateway implements WhatsAppGateway {
  private readonly baseUrl = `https://graph.facebook.com/${env.META_API_VERSION}`;

  async sendTextMessage(params: {
    phoneNumberId: string;
    to: string;
    body: string;
    accessToken: string;
  }): Promise<{ messageId: string }> {
    const res = await fetch(`${this.baseUrl}/${params.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'text',
        text: { preview_url: false, body: params.body },
      }),
    });

    const data = await res.json() as { messages?: Array<{ id: string }>; error?: { message: string } };
    if (!res.ok) throw new Error(`WhatsApp send error: ${data.error?.message}`);
    return { messageId: data.messages?.[0]?.id ?? '' };
  }

  async sendTemplateMessage(params: {
    phoneNumberId: string;
    to: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
    accessToken: string;
  }): Promise<{ messageId: string }> {
    const res = await fetch(`${this.baseUrl}/${params.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'template',
        template: {
          name: params.templateName,
          language: { code: params.languageCode },
          ...(params.components && { components: params.components }),
        },
      }),
    });

    const data = await res.json() as { messages?: Array<{ id: string }>; error?: { message: string } };
    if (!res.ok) throw new Error(`WhatsApp template error: ${data.error?.message}`);
    return { messageId: data.messages?.[0]?.id ?? '' };
  }
}
