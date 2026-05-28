declare global {
  interface Window {
    nf: NextFacePixel;
    _nfq?: Array<[string, ...unknown[]]>;
  }
}

interface PixelConfig {
  pixelId: string;
  endpoint?: string;
  debug?: boolean;
}

interface TrackParams {
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  creativeId?: string;
  [key: string]: unknown;
}

type NextFacePixel = (command: string, ...args: unknown[]) => void;

function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(str.toLowerCase().trim()))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
}

function getFbp(): string | undefined {
  const match = document.cookie.match(/_fbp=([^;]+)/);
  return match?.[1];
}

function getFbc(): string | undefined {
  const match = document.cookie.match(/_fbc=([^;]+)/);
  if (match?.[1]) return match[1];
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
  return undefined;
}

function getUtms(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => {
    const v = params.get(k);
    if (v) utms[k] = v;
  });
  return utms;
}

class PixelClient {
  private config: PixelConfig | null = null;
  private queue: Array<[string, ...unknown[]]> = [];

  init(pixelId: string, opts?: Partial<PixelConfig>) {
    this.config = { pixelId, endpoint: opts?.endpoint ?? 'https://pixel.nextface.app', debug: opts?.debug ?? false };
    this.flush();
  }

  async track(eventName: string, params: TrackParams = {}) {
    if (!this.config) {
      this.queue.push(['track', eventName, params]);
      return;
    }

    const [emailHash, phoneHash] = await Promise.all([
      params.email ? sha256(params.email) : Promise.resolve(undefined),
      params.phone ? sha256(params.phone) : Promise.resolve(undefined),
    ]);

    const payload = {
      pixelId: this.config.pixelId,
      eventName,
      eventId: `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      occurredAt: new Date().toISOString(),
      url: window.location.href,
      fbp: getFbp(),
      fbc: getFbc(),
      emailHash,
      phoneHash,
      externalId: params.externalId,
      value: params.value,
      currency: params.currency ?? 'BRL',
      creativeId: params.creativeId,
      ...getUtms(),
    };

    if (this.config.debug) console.log('[NextFace Pixel]', payload);

    try {
      await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (err) {
      if (this.config.debug) console.error('[NextFace Pixel] Error:', err);
    }
  }

  pageView() {
    return this.track('page_view');
  }

  private flush() {
    const q = this.queue.splice(0);
    for (const [cmd, ...args] of q) {
      if (cmd === 'track') this.track(args[0] as string, args[1] as TrackParams);
      if (cmd === 'page_view') this.pageView();
    }
  }
}

const client = new PixelClient();

export function nf(command: 'init', pixelId: string, opts?: Partial<PixelConfig>): void;
export function nf(command: 'track', eventName: string, params?: TrackParams): void;
export function nf(command: 'page_view'): void;
export function nf(command: string, ...args: unknown[]): void {
  if (command === 'init') client.init(args[0] as string, args[1] as Partial<PixelConfig>);
  else if (command === 'track') client.track(args[0] as string, args[1] as TrackParams);
  else if (command === 'page_view') client.pageView();
}

if (typeof window !== 'undefined') {
  window.nf = nf;
  const q = window._nfq ?? [];
  delete window._nfq;
  q.forEach(([cmd, ...args]) => nf(cmd, ...args as never[]));
}

export default nf;
