import type { PublishingGateway, PublishParams, PublishResult } from '@nextface/application';
import { env } from '../../lib/env';

export class MetaPublishingGatewayImpl implements PublishingGateway {
  private readonly baseUrl = `https://graph.facebook.com/${env.META_API_VERSION}`;

  async publish(params: PublishParams, credentials: Record<string, string>): Promise<PublishResult> {
    const { accessToken, pageId } = credentials;
    const channel = params.channel;

    if (channel === 'META_FEED' || channel === 'META_REELS' || channel === 'IG_FEED' || channel === 'IG_REELS') {
      const igAccountId = credentials.instagramAccountId;

      if (igAccountId && (channel === 'IG_FEED' || channel === 'IG_REELS')) {
        return this.publishToInstagram(igAccountId, params, accessToken ?? '');
      }

      if (pageId) {
        return this.publishToFacebookPage(pageId, params, accessToken ?? '');
      }
    }

    console.warn(`MetaPublishingGateway: channel ${channel} sem implementação completa — publicação stub`);
    return { externalId: `stub_${Date.now()}`, publishedAt: new Date() };
  }

  private async publishToInstagram(
    igAccountId: string,
    params: PublishParams,
    accessToken: string,
  ): Promise<PublishResult> {
    const isVideo = !!params.assets.videoUrl;
    const mediaType = isVideo ? 'REELS' : 'IMAGE';

    const containerRes = await fetch(`${this.baseUrl}/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(isVideo ? { video_url: params.assets.videoUrl ?? '', media_type: mediaType } : { image_url: params.assets.imageUrl ?? '' }),
        caption: params.copy.primary,
        access_token: accessToken,
      }),
    });

    const container = await containerRes.json() as { id?: string; error?: { message: string } };
    if (!container.id) throw new Error(`Instagram container error: ${container.error?.message}`);

    const publishRes = await fetch(`${this.baseUrl}/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
    });

    const published = await publishRes.json() as { id?: string; error?: { message: string } };
    if (!published.id) throw new Error(`Instagram publish error: ${published.error?.message}`);

    return {
      externalId: published.id,
      url: `https://www.instagram.com/p/${published.id}`,
      publishedAt: new Date(),
    };
  }

  private async publishToFacebookPage(
    pageId: string,
    params: PublishParams,
    accessToken: string,
  ): Promise<PublishResult> {
    const endpoint = params.assets.videoUrl ? `${this.baseUrl}/${pageId}/videos` : `${this.baseUrl}/${pageId}/feed`;

    const body: Record<string, string> = {
      message: params.copy.primary,
      access_token: accessToken,
    };

    if (params.assets.videoUrl) body.file_url = params.assets.videoUrl;
    if (params.assets.imageUrl && !params.assets.videoUrl) body.link = params.assets.imageUrl;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json() as { id?: string; error?: { message: string } };
    if (!data.id) throw new Error(`Facebook Page publish error: ${data.error?.message}`);

    return { externalId: data.id, publishedAt: new Date() };
  }

  async pause(externalId: string, credentials: Record<string, string>): Promise<void> {
    await fetch(`${this.baseUrl}/${externalId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: false, access_token: credentials.accessToken }),
    });
  }

  async delete(externalId: string, credentials: Record<string, string>): Promise<void> {
    await fetch(`${this.baseUrl}/${externalId}?access_token=${credentials.accessToken}`, {
      method: 'DELETE',
    });
  }
}
