export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db';

function verifyKiwify(rawBody: string, signature: string | null): boolean {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = createHmac('sha1', secret).update(rawBody).digest('hex');
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-kiwify-signature');

  if (!verifyKiwify(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { payload = rawBody; }

  const data = payload as Record<string, unknown>;
  const eventType = String(data.order_status ?? data.event ?? 'unknown');

  await prisma.webhookEvent.create({
    data: { provider: 'KIWIFY', eventType, payload: data as never, status: 'received' },
  });

  return NextResponse.json({ ok: true });
}
