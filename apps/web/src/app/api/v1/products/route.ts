export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
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
