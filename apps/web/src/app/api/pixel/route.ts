export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

function sha256(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    orgId: string;
    eventName: string;
    eventId: string;
    occurredAt?: string;
    url?: string;
    fbp?: string;
    fbc?: string;
    email?: string;
    phone?: string;
    externalId?: string;
    value?: number;
    currency?: string;
    creativeId?: string;
    publicationId?: string;
  };

  if (!body.orgId || !body.eventName || !body.eventId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '';
  const ua = req.headers.get('user-agent') ?? '';

  try {
    await prisma.pixelEvent.create({
      data: {
        orgId: body.orgId,
        eventName: body.eventName,
        eventId: body.eventId,
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
        url: body.url,
        fbp: body.fbp,
        fbc: body.fbc,
        ipHash: ip ? sha256(ip) : null,
        uaHash: ua ? sha256(ua) : null,
        emailHash: body.email ? sha256(body.email) : null,
        phoneHash: body.phone ? sha256(body.phone) : null,
        externalId: body.externalId,
        value: body.value,
        currency: body.currency,
        creativeId: body.creativeId,
        publicationId: body.publicationId,
        raw: body,
      },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      // Duplicate event — idempotent no-op
    } else {
      throw e;
    }
  }

  return new NextResponse(null, { status: 204 });
}
