export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const integration = await prisma.integration.findUnique({ where: { id } });
  if (!integration || integration.orgId !== session.user.orgId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.integration.update({ where: { id }, data: { status: 'REVOKED' } });

  await prisma.auditLog.create({
    data: {
      orgId: session.user.orgId,
      actorType: 'user',
      actorId: session.user.id!,
      action: 'integration.revoked',
      resourceType: 'Integration',
      resourceId: id,
      after: { provider: integration.provider, status: 'REVOKED' } as never,
    },
  });

  return NextResponse.json({ ok: true });
}
