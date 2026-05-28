export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { status: 'asc' },
    include: { _count: { select: { adSets: true } } },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const campaign = await prisma.campaign.create({
      data: {
        orgId: session.user.orgId,
        name: body.name,
        channel: body.channel,
        status: 'PAUSED',
        budgetDaily: body.budgetDaily ?? 0,
        objective: body.objective ?? 'CONVERSIONS',
        metadata: body.metadata ?? {},
      },
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: { code: 'create_failed', message: String(err) } }, { status: 500 });
  }
}
