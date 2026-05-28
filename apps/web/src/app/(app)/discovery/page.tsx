import { prisma } from '@/lib/db';
import { DiscoveryView } from '@/views/discovery/DiscoveryView';

export default async function DiscoveryPage() {
  const products = await prisma.product.findMany({
    where: { blocked: false },
    orderBy: { hotScore: 'desc' },
    take: 20,
    select: {
      id: true, source: true, name: true, niche: true,
      hotScore: true, saturation: true, dossier: true, updatedAt: true,
    },
  });

  return <DiscoveryView products={products} />;
}
