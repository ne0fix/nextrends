export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TikTokOAuthGatewayImpl } from '@/infrastructure/integrations/TikTokOAuthGatewayImpl';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const gateway = new TikTokOAuthGatewayImpl();
  const state = `${session.user.orgId}:${session.user.id}:${Date.now()}`;
  const authUrl = gateway.buildAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
