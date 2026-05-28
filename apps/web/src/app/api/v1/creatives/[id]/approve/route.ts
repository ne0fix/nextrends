export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getContainer } from '@/lib/container';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Unauthorized' } }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const container = await getContainer();
    const result = await container.approveCreative.execute({
      orgId: session.user.orgId,
      actorId: session.user.id!,
      creativeId: id,
      approved: Boolean(body.approved),
      reason: body.reason,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { code: 'approve_failed', message } }, { status: 500 });
  }
}
