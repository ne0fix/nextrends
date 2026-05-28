export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const channels = await prisma.socialChannel.findMany({ where: { orgId: session.user.orgId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ channels });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { getContainer } = await import('@/lib/container');
    const container = await getContainer();
    const result = await container.createChannel.execute({
      orgId: session.user.orgId,
      actorId: session.user.id!,
      provider: body.provider,
      handle: body.handle,
      brandDna: body.brandDna,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: { code: 'create_failed', message: String(err) } }, { status: 500 });
  }
}
