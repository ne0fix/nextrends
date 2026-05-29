export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { DiscoveryView } from '@/views/discovery/DiscoveryView';

export default async function DiscoveryPage() {
  const raw = await prisma.product.findMany({
    where: { blocked: false },
    orderBy: { hotScore: 'desc' },
    take: 20,
    select: {
      id: true, source: true, name: true, niche: true,
      hotScore: true, saturation: true, dossier: true, updatedAt: true,
    },
  });

  // Converte Decimal → number para poder passar para Client Components
  const products = raw.map(p => ({
    ...p,
    hotScore: Number(p.hotScore),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <DiscoveryView products={products} />;
}
