export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getContainer } from '@/lib/container';

export async function POST(req: NextRequest) {
  const workerSecret = req.headers.get('x-worker-secret');
  const isWorker = !!(workerSecret && workerSecret === process.env.WORKER_SECRET);

  const session = isWorker ? null : await auth();
  if (!isWorker && !session?.user?.orgId) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const orgId = isWorker ? body.orgId : session!.user!.orgId!;
    const actorId = isWorker ? (body.actorId ?? 'worker') : session!.user!.id!;

    const container = await getContainer();
    const result = await container.publishToChannel.execute({
      orgId,
      actorId,
      creativeId: body.creativeId,
      channel: body.channel,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      idempotencyKey: body.idempotencyKey,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('publish error', err);
    return NextResponse.json({ error: { code: 'publish_failed', message } }, { status: 500 });
  }
}
