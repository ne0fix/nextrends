import type { MetaOAuthGateway } from '@nextface/application';
import { env } from '../../lib/env';

export class MetaOAuthGatewayImpl implements MetaOAuthGateway {
  private readonly baseUrl = `https://graph.facebook.com/${env.META_API_VERSION}`;

  async exchangeCode(code: string, redirectUri: string) {
    const url = new URL(`${this.baseUrl}/oauth/access_token`);
    url.searchParams.set('client_id', env.META_APP_ID);
    url.searchParams.set('client_secret', env.META_APP_SECRET);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('code', code);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json() as { error?: { message: string } };
      throw new Error(`Meta OAuth error: ${err.error?.message}`);
    }

    const data = await res.json() as {
      access_token: string;
      token_type: string;
      expires_in?: number;
    };

    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined;

    // Exchange for long-lived token
    const llUrl = new URL(`${this.baseUrl}/oauth/access_token`);
    llUrl.searchParams.set('grant_type', 'fb_exchange_token');
    llUrl.searchParams.set('client_id', env.META_APP_ID);
    llUrl.searchParams.set('client_secret', env.META_APP_SECRET);
    llUrl.searchParams.set('fb_exchange_token', data.access_token);

    const llRes = await fetch(llUrl.toString());
    const llData = await llRes.json() as { access_token: string; expires_in?: number };
    const llToken = llRes.ok ? llData.access_token : data.access_token;

    return {
      accessToken: llToken,
      expiresAt: llData.expires_in ? new Date(Date.now() + llData.expires_in * 1000) : expiresAt,
      scopes: [],
    };
  }

  async fetchBusinessResources(accessToken: string) {
    const base = `${this.baseUrl}/me`;

    const bizRes = await fetch(`${base}?fields=businesses{id,name}&access_token=${accessToken}`);
    const bizData = await bizRes.json() as { businesses?: { data: Array<{ id: string }> } };
    const businessId = bizData.businesses?.data[0]?.id ?? '';

    const [adRes, pagesRes] = await Promise.all([
      fetch(`${this.baseUrl}/${businessId}/owned_ad_accounts?fields=id&access_token=${accessToken}`),
      fetch(`${this.baseUrl}/${businessId}/owned_pages?fields=id,instagram_business_account&access_token=${accessToken}`),
    ]);

    const adData = await adRes.json() as { data?: Array<{ id: string }> };
    const pagesData = await pagesRes.json() as {
      data?: Array<{ id: string; instagram_business_account?: { id: string } }>;
    };

    const adAccounts = adData.data?.map(a => a.id) ?? [];
    const pages = pagesData.data?.map(p => p.id) ?? [];
    const instagramAccounts = pagesData.data?.flatMap(p =>
      p.instagram_business_account ? [p.instagram_business_account.id] : []
    ) ?? [];

    return { businessId, adAccounts, pages, instagramAccounts, pixelIds: [] };
  }
}
