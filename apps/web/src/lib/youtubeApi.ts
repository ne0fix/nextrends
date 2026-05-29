import type { ViralVideo } from '@/types/viral';
import { buildMarketplaceUrl } from './marketplaceUrl';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

const POPULAR_CATEGORIES = [
  { ytId: '26', appCat: 'Beleza'         },
  { ytId: '28', appCat: 'Tecnologia'     },
  { ytId: '22', appCat: 'Entretenimento' },
  { ytId: '24', appCat: 'Entretenimento' },
  { ytId: '17', appCat: 'Moda'           },
];

const PRODUCT_QUERIES = [
  { q: 'review produto viral shopee brasil',             cat: 'Tecnologia'     },
  { q: 'unboxing gadget viral tiktok brasil',            cat: 'Tecnologia'     },
  { q: 'haul shopee produtos virais brasil 2025',        cat: 'Moda'           },
  { q: 'massageador cervical viral review antes depois', cat: 'Saúde'          },
  { q: 'skincare rotina facial produto viral',           cat: 'Beleza'         },
  { q: 'airfryer receita viral brasil',                  cat: 'Culinária'      },
  { q: 'smartwatch barato shopee vale a pena',           cat: 'Tecnologia'     },
  { q: 'câmera segurança wifi 4k instalação',            cat: 'Segurança'      },
  { q: 'led planta indoor crescimento viral',            cat: 'Casa'           },
  { q: 'colágeno suplemento pele resultado viral',       cat: 'Beleza'         },
  { q: 'mini projetor portátil review unboxing',         cat: 'Entretenimento' },
  { q: 'tênis feminino moda viral haul shein',           cat: 'Moda'           },
];

interface YTItem {
  id: string | { videoId: string };
  snippet?: {
    title: string;
    description: string;
    thumbnails?: { maxres?: { url: string }; high?: { url: string }; medium?: { url: string } };
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration?: string };
}

function parseDuration(iso = ''): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] || '0');
  const min = parseInt(m[2] || '0');
  const sec = parseInt(m[3] || '0');
  return h > 0
    ? `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${min}:${String(sec).padStart(2, '0')}`;
}

function detectInfo(title: string, desc: string, appCat: string) {
  const text = (title + ' ' + desc).toLowerCase();
  let category = appCat;
  if (!category || category === 'Geral') {
    if (/saúde|massagea|dor|colágeno|suplemento/.test(text))  category = 'Saúde';
    else if (/skincare|beleza|maquiagem|cabelo|pele/.test(text)) category = 'Beleza';
    else if (/roupa|moda|tênis|sapato|haul|fashion/.test(text)) category = 'Moda';
    else if (/receita|airfryer|cozinha|comida/.test(text))     category = 'Culinária';
    else if (/câmera|segurança|cctv/.test(text))               category = 'Segurança';
    else category = 'Tecnologia';
  }

  let marketplace: import('@/types/viral').MarketplacePlatform = 'shopee';
  if (/amazon/.test(text))               marketplace = 'amazon';
  else if (/mercado livre/.test(text))   marketplace = 'mercadolivre';
  else if (/magalu|magazine/.test(text)) marketplace = 'magalu';
  else if (/americanas/.test(text))      marketplace = 'americanas';
  else if (/shein/.test(text))           marketplace = 'shein';
  else if (/aliexpress/.test(text))      marketplace = 'aliexpress';
  else if (/tiktok shop/.test(text))     marketplace = 'tiktokshop';

  const productName = title
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[|!?\[\]()]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');

  const platform: ViralVideo['platform'] = /\bshorts\b/i.test(title) ? 'shorts' : 'youtube';
  return { category, marketplace, productName, platform };
}

function buildVideo(item: YTItem, appCat: string): ViralVideo | null {
  const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId;
  if (!videoId) return null;

  const views    = parseInt(item.statistics?.viewCount   || '0');
  const likes    = parseInt(item.statistics?.likeCount   || '0');
  const comments = parseInt(item.statistics?.commentCount || '0');
  const title    = item.snippet?.title ?? '';
  const desc     = item.snippet?.description ?? '';
  const thumbnail = item.snippet?.thumbnails?.maxres?.url
    ?? item.snippet?.thumbnails?.high?.url
    ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const tags = (item.snippet?.tags ?? []).slice(0, 6).map(t => `#${t.replace(/\s+/g, '')}`);
  const trendScore = Math.min(99, Math.max(62,
    views > 50_000_000 ? 99 : views > 10_000_000 ? 96 : views > 5_000_000 ? 92 :
    views > 1_000_000 ? 85 : views > 500_000 ? 78 : 68,
  ));
  const { category, marketplace: mp, productName, platform } = detectInfo(title, desc, appCat);

  return {
    id: `yt_${videoId}`,
    title,
    thumbnail,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
    platform,
    views,
    likes,
    comments,
    shares: Math.round(likes * 0.1),
    duration: parseDuration(item.contentDetails?.duration),
    author: item.snippet?.channelTitle ?? '',
    category,
    hashtags: tags.length ? tags : [`#${category.toLowerCase()}`, '#viral', '#brasil'],
    postedAt: (item.snippet?.publishedAt ?? new Date().toISOString()).slice(0, 10),
    trendScore,
    linkedProduct: { name: productName, marketplace: mp, url: buildMarketplaceUrl(mp, productName), price: 0 },
  };
}

async function fetchVideoStats(videoIds: string[], apiKey: string): Promise<Record<string, YTItem>> {
  if (!videoIds.length) return {};
  const params = new URLSearchParams({ key: apiKey, id: videoIds.join(','), part: 'statistics,snippet,contentDetails' });
  const res = await fetch(`${YT_BASE}/videos?${params}`, { next: { revalidate: 1800 } });
  if (!res.ok) return {};
  const data = await res.json();
  const map: Record<string, YTItem> = {};
  (data.items ?? []).forEach((v: YTItem) => { map[v.id as string] = v; });
  return map;
}

async function fetchMostPopular(apiKey: string, maxPerCat = 5): Promise<ViralVideo[]> {
  const allIds: { id: string; cat: string }[] = [];
  await Promise.all(
    POPULAR_CATEGORIES.map(async ({ ytId, appCat }) => {
      const params = new URLSearchParams({
        key: apiKey, chart: 'mostPopular', regionCode: 'BR', hl: 'pt_BR',
        videoCategoryId: ytId, part: 'id', maxResults: String(maxPerCat),
      });
      try {
        const res = await fetch(`${YT_BASE}/videos?${params}`, { next: { revalidate: 1800 } });
        if (!res.ok) return;
        const data = await res.json();
        (data.items ?? []).forEach((v: { id: string }) => allIds.push({ id: v.id, cat: appCat }));
      } catch { /* ignora erro de quota */ }
    }),
  );
  const unique = [...new Map(allIds.map(x => [x.id, x])).values()];
  const statsMap = await fetchVideoStats(unique.map(x => x.id), apiKey);
  return unique.map(({ id, cat }) => buildVideo({ ...statsMap[id], id }, cat)).filter((v): v is ViralVideo => v !== null);
}

async function fetchProductSearchVideos(apiKey: string, perQuery = 2): Promise<ViralVideo[]> {
  const publishedAfter = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const allIds: { id: string; cat: string }[] = [];
  await Promise.all(
    PRODUCT_QUERIES.map(async ({ q, cat }) => {
      const params = new URLSearchParams({
        key: apiKey, q, type: 'video', part: 'id',
        maxResults: String(perQuery), regionCode: 'BR',
        relevanceLanguage: 'pt', order: 'viewCount', publishedAfter,
      });
      try {
        const res = await fetch(`${YT_BASE}/search?${params}`, { next: { revalidate: 1800 } });
        if (!res.ok) return;
        const data = await res.json();
        (data.items ?? []).forEach((item: { id?: { videoId?: string } }) => {
          const vid = item.id?.videoId;
          if (vid) allIds.push({ id: vid, cat });
        });
      } catch { /* ignora */ }
    }),
  );
  const unique = [...new Map(allIds.map(x => [x.id, x])).values()];
  const statsMap = await fetchVideoStats(unique.map(x => x.id), apiKey);
  return unique.map(({ id, cat }) => buildVideo({ ...statsMap[id], id }, cat)).filter((v): v is ViralVideo => v !== null);
}

export async function fetchTrendingYouTubeVideos(): Promise<ViralVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];
  const [popular, searched] = await Promise.allSettled([
    fetchMostPopular(apiKey, 4),
    fetchProductSearchVideos(apiKey, 2),
  ]);
  const all = [
    ...(popular.status  === 'fulfilled' ? popular.value  : []),
    ...(searched.status === 'fulfilled' ? searched.value : []),
  ];
  const seen = new Map<string, ViralVideo>();
  all.forEach(v => seen.set(v.id, v));
  return [...seen.values()].sort((a, b) => b.views - a.views);
}
