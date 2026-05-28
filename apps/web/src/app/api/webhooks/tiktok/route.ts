export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db';

function verifyTikTok(rawBody: string, timestamp: string | null, nonce: string | null, signature: string | null): boolean {
  const secret = process.env.TIKTOK_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!timestamp || !nonce || !signature) return false;
  const strToSign = [timestamp, nonce, rawBody].sort().join('');
  const expected = createHmac('sha256', secret).update(strToSign).digest('hex');
  return expected === signature;
}

export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get('challenge');
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const timestamp = req.headers.get('x-tiktok-timestamp');
  const nonce = req.headers.get('x-tiktok-nonce');
  const signature = req.headers.get('x-tiktok-signature');

  if (!verifyTikTok(rawBody, timestamp, nonce, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { payload = rawBody; }

  const data = payload as Record<string, unknown>;

  await prisma.webhookEvent.create({
    data: { provider: 'TIKTOK', eventType: String(data.event_type ?? 'unknown'), payload: data as never, status: 'received' },
  });

  return NextResponse.json({ code: 0, message: 'ok' });
}
