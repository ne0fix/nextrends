export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const niche = searchParams.get('niche');
  const limit = Number(searchParams.get('limit') ?? 20);

  const products = await prisma.product.findMany({
    where: { blocked: false, ...(niche && { niche }) },
    orderBy: { hotScore: 'desc' },
    take: limit,
    select: {
      id: true, source: true, name: true, niche: true,
      hotScore: true, saturation: true, dossier: true,
    },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { getContainer } = await import('@/lib/container');
    const container = await getContainer();
    const result = await container.indexProduct.execute({
      orgId: session.user.orgId,
      actorId: session.user.id!,
      source: body.source,
      externalId: body.externalId,
      name: body.name,
      niche: body.niche,
      rawData: body.rawData ?? {},
      saturation: body.saturation,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { code: 'index_failed', message } }, { status: 500 });
  }
}
