import type { ViralVideo, ChartDataPoint } from '@/types/viral';
import { buildMarketplaceUrl } from './marketplaceUrl';

export const mockViralVideos: ViralVideo[] = [
  {
    id: 'mock_yt_1',
    title: 'Massageador Cervical EMS — Resultado Real em 7 Dias | Review Completo',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    platform: 'youtube',
    views: 4800000, likes: 312000, comments: 8400, shares: 31200,
    duration: '8:42', author: 'TechHealth Brasil',
    category: 'Saúde', postedAt: '2026-05-10', trendScore: 96,
    hashtags: ['#massageador', '#ems', '#dorcervical', '#saude', '#viral'],
    linkedProduct: { name: 'Massageador Cervical EMS', marketplace: 'shopee', url: buildMarketplaceUrl('shopee', 'Massageador Cervical EMS'), price: 89.9 },
  },
  {
    id: 'mock_yt_2',
    title: 'Testei a LUZ LED de Planta Viral do TikTok — Vale a Pena?',
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    platform: 'shorts',
    views: 2100000, likes: 187000, comments: 4300, shares: 18700,
    duration: '0:58', author: 'GreenHome Brasil',
    category: 'Casa', postedAt: '2026-05-14', trendScore: 92,
    hashtags: ['#plantasindoor', '#ledplanta', '#jardinagem', '#shorts'],
    linkedProduct: { name: 'Luz LED Crescimento Plantas', marketplace: 'shopee', url: buildMarketplaceUrl('shopee', 'Luz LED Crescimento Plantas'), price: 45.9 },
  },
  {
    id: 'mock_yt_3',
    title: 'HAUL SHOPEE 2026 — 10 Produtos Virais que Todo Mundo Quer',
    thumbnail: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    platform: 'youtube',
    views: 3400000, likes: 258000, comments: 6100, shares: 25800,
    duration: '15:20', author: 'ShopeeHaul Oficial',
    category: 'Moda', postedAt: '2026-05-08', trendScore: 94,
    hashtags: ['#haul', '#shopee', '#viral', '#desconto'],
    linkedProduct: { name: 'Produtos Virais Shopee', marketplace: 'shopee', url: buildMarketplaceUrl('shopee', 'produtos virais'), price: 0 },
  },
  {
    id: 'mock_yt_4',
    title: 'Câmera 4K WiFi Colorida Noturna — Instalei Sozinha em 10 Minutos',
    thumbnail: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    platform: 'youtube',
    views: 1850000, likes: 94000, comments: 3100, shares: 9400,
    duration: '11:05', author: 'Segurança em Casa',
    category: 'Segurança', postedAt: '2026-05-12', trendScore: 88,
    hashtags: ['#camera4k', '#seguranca', '#wifi', '#tutorial'],
    linkedProduct: { name: 'Câmera Segurança WiFi 4K', marketplace: 'mercadolivre', url: buildMarketplaceUrl('mercadolivre', 'Câmera Segurança WiFi 4K'), price: 189.9 },
  },
  {
    id: 'mock_yt_5',
    title: 'Rotina Skincare Coreana — Transformação em 30 Dias com Produtos Baratos',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    platform: 'reels',
    views: 6200000, likes: 521000, comments: 14200, shares: 52100,
    duration: '1:15', author: 'Skincare Natural',
    category: 'Beleza', postedAt: '2026-05-17', trendScore: 98,
    hashtags: ['#skincare', '#coreana', '#beleza', '#pele', '#viral'],
    linkedProduct: { name: 'Kit Skincare Coreano', marketplace: 'shein', url: buildMarketplaceUrl('shein', 'kit skincare coreano'), price: 67.9 },
  },
  {
    id: 'mock_yt_6',
    title: 'Airfryer 5L — Fiz 15 Receitas em 1 Semana | Testei Tudo',
    thumbnail: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    platform: 'youtube',
    views: 2700000, likes: 198000, comments: 5200, shares: 19800,
    duration: '18:45', author: 'Cozinha Viral',
    category: 'Culinária', postedAt: '2026-05-06', trendScore: 91,
    hashtags: ['#airfryer', '#receitas', '#cozinha', '#viral'],
    linkedProduct: { name: 'Airfryer Digital 5L', marketplace: 'americanas', url: buildMarketplaceUrl('americanas', 'Airfryer Digital 5L'), price: 249.9 },
  },
];

export const engagementChartData: ChartDataPoint[] = [
  { name: 'Seg', value: 4200, secondary: 1800 },
  { name: 'Ter', value: 5800, secondary: 2400 },
  { name: 'Qua', value: 4900, secondary: 2100 },
  { name: 'Qui', value: 7200, secondary: 3100 },
  { name: 'Sex', value: 9100, secondary: 4200 },
  { name: 'Sáb', value: 11400, secondary: 5800 },
  { name: 'Dom', value: 8300, secondary: 3900 },
];

export const categoryChartData: ChartDataPoint[] = [
  { name: 'Tecnologia',  value: 32 },
  { name: 'Saúde',       value: 24 },
  { name: 'Beleza',      value: 21 },
  { name: 'Moda',        value: 14 },
  { name: 'Casa',        value: 9  },
];

export const spendTrendData: ChartDataPoint[] = [
  { name: 'Sem 1', value: 48000, secondary: 12000 },
  { name: 'Sem 2', value: 62000, secondary: 18000 },
  { name: 'Sem 3', value: 57000, secondary: 15000 },
  { name: 'Sem 4', value: 91000, secondary: 24000 },
  { name: 'Sem 5', value: 124000, secondary: 38000 },
  { name: 'Sem 6', value: 108000, secondary: 31000 },
];

export const platformChartData: ChartDataPoint[] = [
  { name: 'YouTube',   value: 42 },
  { name: 'Instagram', value: 31 },
  { name: 'TikTok',    value: 19 },
  { name: 'Facebook',  value: 8  },
];
