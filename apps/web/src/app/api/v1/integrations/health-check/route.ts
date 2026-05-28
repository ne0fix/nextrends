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
    const body = await req.json().catch(() => ({}));
    const orgId = isWorker ? body.orgId : session!.user!.orgId!;
    const container = await getContainer();
    await container.healthCheckIntegrations.execute(orgId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { code: 'health_check_failed', message } }, { status: 500 });
  }
}
