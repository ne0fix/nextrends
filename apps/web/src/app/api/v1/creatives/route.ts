import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getContainer } from '@/lib/container';
import { GenerateCreativeInputSchema } from '@nextface/schemas';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get('limit') ?? 50);
  const cursor = searchParams.get('cursor') ?? undefined;

  const creatives = await prisma.creative.findMany({
    where: { orgId: session.user.orgId },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, format: true, hookType: true, angle: true,
      status: true, riskScore: true, createdAt: true,
      assets: true, product: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ creatives, nextCursor: creatives[creatives.length - 1]?.id });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as unknown;
  const input = GenerateCreativeInputSchema.parse({ ...body, orgId: session.user.orgId });

  const container = await getContainer();
  const result = await container.generateCreative.execute(input);

  return NextResponse.json(result, { status: 201 });
}
