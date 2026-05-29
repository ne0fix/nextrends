import { env } from '../../lib/env';

export interface MetaAd {
  id: string;
  pageId: string;
  pageName: string;
  adCreativeBody?: string;
  adCreativeLinkTitle?: string;
  adDeliveryStartTime: string;
  impressionsLow?: number;
  impressionsHigh?: number;
  spendLow?: number;
  spendHigh?: number;
  currency?: string;
  bylines?: string;
}

export class MetaAdLibraryGateway {
  private readonly base = `https://graph.facebook.com/${env.META_API_VERSION}/ads_archive`;

  async searchAds(params: {
    accessToken: string;
    searchTerms: string;
    adType?: string;
    country?: string;
    limit?: number;
  }): Promise<MetaAd[]> {
    const url = new URL(this.base);
    url.searchParams.set('access_token', params.accessToken);
    url.searchParams.set('search_terms', params.searchTerms);
    url.searchParams.set('ad_type', params.adType ?? 'ALL');
    url.searchParams.set('ad_reached_countries', JSON.stringify([params.country ?? 'BR']));
    url.searchParams.set('fields', [
      'id', 'page_id', 'page_name', 'ad_creative_bodies',
      'ad_creative_link_titles', 'ad_delivery_start_time',
      'impressions', 'spend', 'currency', 'bylines',
    ].join(','));
    url.searchParams.set('limit', String(params.limit ?? 15));

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json() as { error?: { message: string } };
      throw new Error(`Meta Ad Library error: ${err.error?.message ?? res.status}`);
    }

    const data = await res.json() as {
      data?: Array<{
        id: string;
        page_id?: string;
        page_name?: string;
        ad_creative_bodies?: string[];
        ad_creative_link_titles?: string[];
        ad_delivery_start_time?: string;
        impressions?: { lower_bound?: string; upper_bound?: string };
        spend?: { lower_bound?: string; upper_bound?: string };
        currency?: string;
        bylines?: string;
      }>;
    };

    return (data.data ?? []).map(ad => ({
      id: ad.id,
      pageId: ad.page_id ?? '',
      pageName: ad.page_name ?? '',
      adCreativeBody: ad.ad_creative_bodies?.[0],
      adCreativeLinkTitle: ad.ad_creative_link_titles?.[0],
      adDeliveryStartTime: ad.ad_delivery_start_time ?? '',
      impressionsLow: Number(ad.impressions?.lower_bound ?? 0),
      impressionsHigh: Number(ad.impressions?.upper_bound ?? 0),
      spendLow: Number(ad.spend?.lower_bound ?? 0),
      spendHigh: Number(ad.spend?.upper_bound ?? 0),
      currency: ad.currency,
      bylines: ad.bylines,
    }));
  }
}
