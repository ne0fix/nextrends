export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac('sha256', env.META_APP_SECRET).update(body).digest('hex');
  return `sha256=${expected}` === signature;
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const data = JSON.parse(rawBody) as Record<string, unknown>;

  await prisma.webhookEvent.create({
    data: { provider: 'WHATSAPP', eventType: 'message', payload: data as never, status: 'received' },
  });

  return NextResponse.json({ ok: true });
}
