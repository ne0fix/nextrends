export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { randomBytes, createHash } from 'crypto';
import { TikTokOAuthGatewayImpl } from '@/infrastructure/integrations/TikTokOAuthGatewayImpl';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // PKCE: gera code_verifier aleatório e deriva code_challenge via SHA-256
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

  const gateway = new TikTokOAuthGatewayImpl();
  const state = `${session.user.orgId}:${session.user.id}:${Date.now()}`;
  const authUrl = gateway.buildAuthUrl(state, codeChallenge);

  const res = NextResponse.redirect(authUrl);

  // Armazena code_verifier em cookie httpOnly para usar no callback
  res.cookies.set('tiktok_pkce', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutos
    path: '/',
  });

  return res;
}
