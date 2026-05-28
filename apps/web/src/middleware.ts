import { NextResponse, type NextRequest } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) return false;
  return true;
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://graph.facebook.com https://api.anthropic.com",
  "frame-ancestors 'none'",
].join('; ');

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isSensitiveApi = pathname.startsWith('/api/v1/') || pathname.startsWith('/api/auth/');
  if (isSensitiveApi) {
    const key = getClientKey(req);
    if (!checkRateLimit(key)) {
      return NextResponse.json({ error: { code: 'rate_limited', message: 'Too many requests' } }, {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
          'X-RateLimit-Reset': String(Math.ceil((Date.now() + RATE_LIMIT_WINDOW_MS) / 1000)),
        },
      });
    }
  }

  const res = NextResponse.next();

  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  if (!pathname.startsWith('/api/')) {
    res.headers.set('Content-Security-Policy', CSP);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
