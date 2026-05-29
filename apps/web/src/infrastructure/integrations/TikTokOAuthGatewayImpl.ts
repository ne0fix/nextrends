import { env } from '../../lib/env';

export interface TikTokTokenResponse {
  accessToken: string;
  refreshToken: string;
  openId: string;
  scope: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

export class TikTokOAuthGatewayImpl {
  private readonly tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
  private readonly userUrl = 'https://open.tiktokapis.com/v2/user/info/';

  buildAuthUrl(state: string): string {
    const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
    url.searchParams.set('client_key', env.TIKTOK_APP_ID ?? '');
    url.searchParams.set('scope', 'user.info.basic,video.list,video.publish');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', env.TIKTOK_OAUTH_REDIRECT_URI ?? '');
    url.searchParams.set('state', state);
    return url.toString();
  }

  async exchangeCode(code: string): Promise<TikTokTokenResponse> {
    const params = new URLSearchParams({
      client_key: env.TIKTOK_APP_ID ?? '',
      client_secret: env.TIKTOK_APP_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.TIKTOK_OAUTH_REDIRECT_URI ?? '',
    });

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json() as {
      data?: {
        access_token: string;
        refresh_token: string;
        open_id: string;
        scope: string;
        expires_in: number;
        refresh_expires_in: number;
      };
      error?: string;
      error_description?: string;
      message?: string;
    };

    if (!res.ok || data.error || !data.data) {
      throw new Error(`TikTok OAuth error: ${data.error_description ?? data.message ?? data.error ?? res.status}`);
    }

    const d = data.data;
    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      openId: d.open_id,
      scope: d.scope,
      expiresAt: new Date(Date.now() + d.expires_in * 1000),
      refreshExpiresAt: new Date(Date.now() + d.refresh_expires_in * 1000),
    };
  }

  async getUserInfo(accessToken: string, openId: string): Promise<{ displayName: string; avatarUrl?: string }> {
    const res = await fetch(
      `${this.userUrl}?fields=display_name,avatar_url`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'x-tt-openid': openId } },
    );
    const data = await res.json() as { data?: { user?: { display_name?: string; avatar_url?: string } } };
    return {
      displayName: data.data?.user?.display_name ?? 'TikTok User',
      avatarUrl: data.data?.user?.avatar_url,
    };
  }
}
