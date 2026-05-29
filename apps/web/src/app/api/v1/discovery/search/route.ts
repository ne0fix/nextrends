export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decryptCredentials } from '@/lib/encryption';
import { YouTubeDiscoveryGateway } from '@/infrastructure/discovery/YouTubeDiscoveryGateway';
import { MetaAdLibraryGateway } from '@/infrastructure/discovery/MetaAdLibraryGateway';
import { env } from '@/lib/env';

function computeHotScore(viewCount: number, likeCount: number, daysOld: number): number {
  const engagement = viewCount > 0 ? (likeCount / viewCount) * 100 : 0;
  const recencyBoost = Math.max(0, 1 - daysOld / 90); // decai em 90 dias
  const viewScore = Math.min(50, Math.log10(viewCount + 1) * 10);
  const engagementScore = Math.min(30, engagement * 3);
  const recencyScore = recencyBoost * 20;
  return Math.round(viewScore + engagementScore + recencyScore);
}

function extractNiche(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  if (text.match(/emagrec|dieta|gordura|peso|slim|detox/)) return 'emagrecimento';
  if (text.match(/relacionamento|sedução|amor|conquista|casamento/)) return 'relacionamento';
  if (text.match(/investimento|renda|dinheiro|financ|rico|bolsa|cripto/)) return 'finanças';
  if (text.match(/marketing|tráfego|vendas|infoproduto|curso online|dropshipping/)) return 'marketing digital';
  if (text.match(/saúde|hormônio|ansiedade|depressão|sono|natural|suplemento/)) return 'saúde';
  if (text.match(/negócio|empreend|startup|produto|empresa|lucro/)) return 'negócios';
  if (text.match(/produtividade|hábito|mindset|foco|sucesso|disciplina/)) return 'desenvolvimento pessoal';
  if (text.match(/musculação|academia|treino|proteína|fitness|corpo/)) return 'fitness';
  if (text.match(/inglês|idioma|concurso|faculdade|vestibular|estudo/)) return 'educação';
  return 'geral';
}

function titleToProductName(title: string): string {
  return title
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\s+#\S+/g, '')        // remove hashtags (ex: #viral #trending)
    .replace(/como |como eu |eu |meu |minha /gi, '')
    .replace(/\s+/g, ' ')           // normaliza múltiplos espaços
    .trim()
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { niches?: string[]; sources?: string[] };
  const niches = body.niches ?? ['marketing digital', 'emagrecimento', 'finanças', 'relacionamento', 'saúde'];
  const sources = body.sources ?? ['youtube', 'meta'];

  const yt = new YouTubeDiscoveryGateway();
  const metaLib = new MetaAdLibraryGateway();

  let metaAccessToken: string | null = null;
  if (sources.includes('meta')) {
    const integration = await prisma.integration.findFirst({
      where: { orgId: session.user.orgId, provider: 'META', status: 'CONNECTED' },
    });
    if (integration) {
      const buf = await prisma.integration.findUnique({ where: { id: integration.id }, select: { encryptedCredentials: true } });
      if (buf?.encryptedCredentials) {
        const creds = await decryptCredentials(Buffer.from(buf.encryptedCredentials as Uint8Array));
        metaAccessToken = creds.accessToken ?? null;
      }
    }
    // Sem fallback para app token: Ads Archive API requer user token com ads_read
    // (app token resulta em "Application does not have permission")
  }

  const indexed: string[] = [];
  const errors: string[] = [];

  for (const niche of niches) {
    // YouTube
    if (sources.includes('youtube')) {
      try {
        const videos = await yt.getTrendingByNiche(niche);
        for (const v of videos.slice(0, 5)) {
          const daysOld = Math.floor((Date.now() - new Date(v.publishedAt).getTime()) / 86400000);
          const hotScore = computeHotScore(v.viewCount, v.likeCount, daysOld);
          const detectedNiche = extractNiche(v.title, v.description);
          const name = titleToProductName(v.title);

          await prisma.product.upsert({
            where: { source_externalId: { source: 'YOUTUBE', externalId: v.videoId } },
            create: {
              source: 'YOUTUBE',
              externalId: v.videoId,
              name,
              niche: detectedNiche,
              hotScore,
              saturation: Math.min(100, Math.floor(v.viewCount / 50000)),
              blocked: false,
              dossier: {
                targetAudience: `Audiência interessada em ${detectedNiche}`,
                pains: [],
                benefits: [],
                objections: [],
                triggers: [],
                proofPoints: [`${v.viewCount.toLocaleString('pt-BR')} visualizações`, v.channelTitle],
                videoId: v.videoId,
                channelTitle: v.channelTitle,
                viewCount: v.viewCount,
                likeCount: v.likeCount,
                tags: v.tags,
                thumbnailUrl: v.thumbnailUrl,
              } as never,
            },
            update: {
              hotScore,
              saturation: Math.min(100, Math.floor(v.viewCount / 50000)),
              dossier: {
                targetAudience: `Audiência interessada em ${detectedNiche}`,
                pains: [],
                benefits: [],
                objections: [],
                triggers: [],
                proofPoints: [`${v.viewCount.toLocaleString('pt-BR')} visualizações`, v.channelTitle],
                videoId: v.videoId,
                channelTitle: v.channelTitle,
                viewCount: v.viewCount,
                likeCount: v.likeCount,
                tags: v.tags,
                thumbnailUrl: v.thumbnailUrl,
              } as never,
            },
          });
          indexed.push(`YT: ${name}`);
        }
      } catch (e) {
        errors.push(`YouTube/${niche}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Meta Ad Library
    if (sources.includes('meta') && metaAccessToken) {
      try {
        const ads = await metaLib.searchAds({ accessToken: metaAccessToken, searchTerms: niche, limit: 8 });
        for (const ad of ads) {
          if (!ad.adCreativeLinkTitle && !ad.adCreativeBody) continue;
          const name = (ad.adCreativeLinkTitle ?? ad.adCreativeBody ?? '').slice(0, 80);
          if (!name.trim()) continue;
          const detectedNiche = extractNiche(name, ad.adCreativeBody ?? '');
          const avgImpressions = ((ad.impressionsLow ?? 0) + (ad.impressionsHigh ?? ad.impressionsLow ?? 0)) / 2;
          const hotScore = Math.min(100, Math.round(Math.log10(avgImpressions + 1) * 15));

          await prisma.product.upsert({
            where: { source_externalId: { source: 'META', externalId: ad.id } },
            create: {
              source: 'META',
              externalId: ad.id,
              name,
              niche: detectedNiche,
              hotScore,
              saturation: 0,
              blocked: false,
              dossier: {
                targetAudience: `Audiência do anúncio Meta — ${ad.pageName}`,
                pains: [],
                benefits: [],
                objections: [],
                triggers: [],
                proofPoints: [ad.pageName, `${avgImpressions.toLocaleString('pt-BR')} impressões est.`],
                adBody: ad.adCreativeBody,
                pageName: ad.pageName,
                impressions: { low: ad.impressionsLow, high: ad.impressionsHigh },
                spend: { low: ad.spendLow, high: ad.spendHigh },
              } as never,
            },
            update: { hotScore },
          });
          indexed.push(`Meta: ${name}`);
        }
      } catch (e) {
        errors.push(`Meta/${niche}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  return NextResponse.json({ indexed: indexed.length, products: indexed, errors });
}
