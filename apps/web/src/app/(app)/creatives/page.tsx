export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreativesView } from '@/views/creatives/CreativesView';

export default async function CreativesPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';

  const creatives = await prisma.creative.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { product: { select: { name: true } } },
  });

  const products = await prisma.product.findMany({
    where: { blocked: false },
    orderBy: { hotScore: 'desc' },
    take: 20,
    select: { id: true, name: true, niche: true },
  });

  return <CreativesView creatives={creatives} products={products} />;
}
