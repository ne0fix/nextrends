export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const launches = await prisma.launch.findMany({ where: { orgId: session.user.orgId }, orderBy: { startsAt: 'desc' } });
  return NextResponse.json({ launches });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { getContainer } = await import('@/lib/container');
    const container = await getContainer();
    const result = await container.initiateLaunch.execute({
      orgId: session.user.orgId,
      actorId: session.user.id!,
      productId: body.productId,
      templateKey: body.templateKey,
      startsAt: new Date(body.startsAt),
      budgetCap: Number(body.budgetCap),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: { code: 'create_failed', message: String(err) } }, { status: 500 });
  }
}
