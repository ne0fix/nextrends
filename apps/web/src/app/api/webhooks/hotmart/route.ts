export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db';

function verifyHotmart(body: string, hottok: string | null): boolean {
  const expected = process.env.HOTMART_WEBHOOK_TOKEN;
  if (!expected) return true;
  return hottok === expected;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hottok = req.headers.get('x-hotmart-hottok');

  if (!verifyHotmart(rawBody, hottok)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { payload = rawBody; }

  const data = payload as Record<string, unknown>;
  const eventType = String(data.event ?? 'unknown');

  await prisma.webhookEvent.create({
    data: { provider: 'HOTMART', eventType, payload: data as never, status: 'received' },
  });

  return NextResponse.json({ ok: true });
}
