import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integrations = await prisma.integration.findMany({
    where: { orgId: session.user.orgId },
    select: {
      id: true, provider: true, status: true,
      externalAccountIds: true, scopes: true,
      lastHealthCheckAt: true, lastHealthOk: true, expiresAt: true,
    },
    orderBy: { provider: 'asc' },
  });

  return NextResponse.json({ integrations });
}
