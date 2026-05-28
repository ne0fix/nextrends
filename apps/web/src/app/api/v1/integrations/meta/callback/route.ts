export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getContainer } from '@/lib/container';
import { env } from '@/lib/env';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/integrations?error=meta_oauth_denied', req.url));
  }

  try {
    const container = await getContainer();
    const result = await container.connectMeta.execute({
      orgId: session.user?.orgId ?? '',
      actorId: session.user?.id ?? '',
      code,
      redirectUri: env.META_OAUTH_REDIRECT_URI,
    });

    return NextResponse.redirect(
      new URL(`/integrations?success=meta&pages=${result.pages.length}&accounts=${result.adAccounts.length}`, req.url)
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Meta OAuth callback error', err);
    return NextResponse.redirect(new URL(`/integrations?error=meta_oauth_failed&detail=${encodeURIComponent(msg)}`, req.url));
  }
}
