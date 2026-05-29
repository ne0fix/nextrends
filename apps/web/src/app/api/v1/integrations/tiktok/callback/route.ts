export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encryptCredentials } from '@/lib/encryption';
import { TikTokOAuthGatewayImpl } from '@/infrastructure/integrations/TikTokOAuthGatewayImpl';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/integrations?error=tiktok_oauth_denied', req.url));
  }

  try {
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('tiktok_pkce')?.value;
    cookieStore.delete('tiktok_pkce');

    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/integrations?error=tiktok_pkce_missing', req.url));
    }

    const gateway = new TikTokOAuthGatewayImpl();
    const tokens = await gateway.exchangeCode(code, codeVerifier);
    const userInfo = await gateway.getUserInfo(tokens.accessToken, tokens.openId).catch(() => ({
      displayName: 'TikTok User',
    }));

    const encrypted = await encryptCredentials({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      openId: tokens.openId,
      scope: tokens.scope,
    });

    await prisma.integration.upsert({
      where: {
        orgId_provider: { orgId: session.user!.orgId!, provider: 'TIKTOK' },
      },
      create: {
        orgId: session.user!.orgId!,
        provider: 'TIKTOK',
        status: 'CONNECTED',
        externalAccountIds: [tokens.openId],
        scopes: tokens.scope.split(',').map(s => s.trim()),
        encryptedCredentials: encrypted as never,
        expiresAt: tokens.expiresAt,
      },
      update: {
        status: 'CONNECTED',
        externalAccountIds: [tokens.openId],
        scopes: tokens.scope.split(',').map(s => s.trim()),
        encryptedCredentials: encrypted as never,
        expiresAt: tokens.expiresAt,
      },
    });

    return NextResponse.redirect(
      new URL('/integrations?success=tiktok', req.url),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('TikTok OAuth callback error', err);
    return NextResponse.redirect(
      new URL(`/integrations?error=tiktok_oauth_failed&detail=${encodeURIComponent(msg)}`, req.url),
    );
  }
}
