export interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  WORKER_SECRET: string;
  WEB_API_URL: string;
}

interface PixelEventBody {
  pixelId: string;
  eventName: string;
  eventId?: string;
  occurredAt?: string;
  url?: string;
  fbp?: string;
  fbc?: string;
  emailHash?: string;
  phoneHash?: string;
  externalId?: string;
  value?: number;
  currency?: string;
  creativeId?: string;
}

const GIF_1x1 = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b,
]);

async function forwardToApi(body: PixelEventBody & { orgId?: string }, env: Env, request: Request): Promise<void> {
  const ua = request.headers.get('user-agent') ?? '';
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '';

  const payload = {
    orgId: body.orgId ?? body.pixelId,
    eventName: body.eventName,
    eventId: body.eventId ?? crypto.randomUUID(),
    occurredAt: body.occurredAt ?? new Date().toISOString(),
    url: body.url,
    fbp: body.fbp,
    fbc: body.fbc,
    emailHash: body.emailHash,
    phoneHash: body.phoneHash,
    externalId: body.externalId,
    value: body.value,
    currency: body.currency,
    creativeId: body.creativeId,
    _meta: { ua, ip: ip.split(',')[0]?.trim() },
  };

  await fetch(`${env.WEB_API_URL}/api/pixel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-worker-secret': env.WORKER_SECRET,
    },
    body: JSON.stringify(payload),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') ?? '*';

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json() as PixelEventBody;
        if (!body.eventName) {
          return new Response(JSON.stringify({ error: 'eventName required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        await forwardToApi(body, env, request);

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Internal error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    if (request.method === 'GET') {
      return new Response(GIF_1x1, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders,
        },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  },
};
