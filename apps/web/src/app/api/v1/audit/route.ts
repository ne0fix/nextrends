export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 50), 200);
  const cursor = req.nextUrl.searchParams.get('cursor') ?? undefined;
  const action = req.nextUrl.searchParams.get('action') ?? undefined;
  const resourceType = req.nextUrl.searchParams.get('resourceType') ?? undefined;

  const entries = await prisma.auditLog.findMany({
    where: {
      orgId: session.user.orgId,
      ...(action && { action: { contains: action } }),
      ...(resourceType && { resourceType }),
    },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, actorType: true, actorId: true, action: true,
      resourceType: true, resourceId: true, reason: true,
      after: true, createdAt: true,
    },
  });

  const nextCursor = entries.length === limit ? entries[entries.length - 1]?.id : null;

  return NextResponse.json({ entries, nextCursor });
}
