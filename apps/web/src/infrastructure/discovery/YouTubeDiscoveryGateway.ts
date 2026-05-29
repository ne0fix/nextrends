import { env } from '../../lib/env';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  tags: string[];
  thumbnailUrl: string;
}

export class YouTubeDiscoveryGateway {
  private readonly base = 'https://www.googleapis.com/youtube/v3';
  private readonly key = env.YOUTUBE_API_KEY ?? '';

  async searchTrending(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
    const searchUrl = new URL(`${this.base}/search`);
    searchUrl.searchParams.set('key', this.key);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'viewCount');
    searchUrl.searchParams.set('maxResults', String(maxResults));
    searchUrl.searchParams.set('relevanceLanguage', 'pt');
    searchUrl.searchParams.set('regionCode', 'BR');
    searchUrl.searchParams.set('videoDuration', 'medium');

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) throw new Error(`YouTube search error: ${searchRes.status}`);
    const searchData = await searchRes.json() as {
      items?: Array<{ id: { videoId: string }; snippet: { title: string; description: string; channelTitle: string; publishedAt: string; thumbnails: { high: { url: string } }; tags?: string[] } }>;
    };

    const videoIds = (searchData.items ?? []).map(i => i.id.videoId).filter(Boolean);
    if (!videoIds.length) return [];

    const statsUrl = new URL(`${this.base}/videos`);
    statsUrl.searchParams.set('key', this.key);
    statsUrl.searchParams.set('id', videoIds.join(','));
    statsUrl.searchParams.set('part', 'statistics,snippet');

    const statsRes = await fetch(statsUrl.toString());
    if (!statsRes.ok) return [];
    const statsData = await statsRes.json() as {
      items?: Array<{ id: string; statistics: { viewCount?: string; likeCount?: string }; snippet: { tags?: string[] } }>;
    };

    const statsMap = new Map((statsData.items ?? []).map(i => [i.id, i]));

    return (searchData.items ?? []).map(item => {
      const stats = statsMap.get(item.id.videoId);
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description.slice(0, 500),
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount: Number(stats?.statistics?.viewCount ?? 0),
        likeCount: Number(stats?.statistics?.likeCount ?? 0),
        tags: stats?.snippet?.tags?.slice(0, 10) ?? [],
        thumbnailUrl: item.snippet.thumbnails?.high?.url ?? '',
      };
    }).sort((a, b) => b.viewCount - a.viewCount);
  }

  async getTrendingByNiche(niche: string): Promise<YouTubeVideo[]> {
    const queries: Record<string, string[]> = {
      'marketing digital': ['curso marketing digital', 'infoproduto vender online', 'tráfego pago'],
      'emagrecimento': ['emagrecer rápido', 'dieta funciona', 'perder peso'],
      'finanças': ['investir dinheiro brasil', 'renda extra', 'independência financeira'],
      'relacionamento': ['relacionamento amoroso', 'como conquistar', 'sedução masculina'],
      'desenvolvimento pessoal': ['produtividade alta performance', 'mindset sucesso', 'hábitos millionários'],
      'saúde': ['saúde natural', 'jejum intermitente', 'hormônios equilíbrio'],
      'negócios': ['empreendedorismo brasil', 'dropshipping 2025', 'negócio online'],
    };

    const nicheKey = Object.keys(queries).find(k => niche.toLowerCase().includes(k)) ?? 'marketing digital';
    const queryList = queries[nicheKey] ?? queries['marketing digital'] ?? [];
    const query = queryList[Math.floor(Math.random() * queryList.length)] ?? queryList[0] ?? 'infoproduto vender online';

    return this.searchTrending(query, 8);
  }
}
