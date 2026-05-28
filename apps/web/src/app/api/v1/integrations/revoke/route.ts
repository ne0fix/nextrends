export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const provider = body.provider as string | undefined;

  const where = {
    orgId: session.user.orgId,
    ...(provider && { provider }),
  };

  const { count } = await prisma.integration.updateMany({
    where,
    data: { status: 'REVOKED' },
  });

  await prisma.auditLog.create({
    data: {
      orgId: session.user.orgId,
      actorType: 'user',
      actorId: session.user.id!,
      action: 'integration.revoke_all',
      resourceType: 'Integration',
      after: { provider: provider ?? 'ALL', count } as never,
    },
  });

  return NextResponse.json({ revoked: count });
}
