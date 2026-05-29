export type MarketplacePlatform =
  | 'shopee' | 'amazon' | 'mercadolivre' | 'magalu' | 'americanas'
  | 'shein' | 'aliexpress' | 'tiktokshop' | 'shopify' | 'outro';

export type SocialPlatform =
  | 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'reels' | 'shorts';

export interface MarketplaceInfo {
  platform: MarketplacePlatform;
  url: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  soldCount?: number;
  seller?: string;
}

export interface ViralVideo {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  embedUrl?: string;
  platform: SocialPlatform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: string;
  author: string;
  category: string;
  hashtags: string[];
  postedAt: string;
  trendScore: number;
  linkedProduct?: {
    name: string;
    marketplace: MarketplacePlatform;
    url: string;
    price: number;
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}
