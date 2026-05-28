export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LaunchesView } from '@/views/launches/LaunchesView';

export default async function LaunchesPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';
  const [launches, products] = await Promise.all([
    prisma.launch.findMany({ where: { orgId }, orderBy: { startsAt: 'desc' }, include: { org: false } }),
    prisma.product.findMany({ where: { blocked: false }, orderBy: { hotScore: 'desc' }, take: 20, select: { id: true, name: true } }),
  ]);
  return <LaunchesView products={products} launches={launches.map(l => ({ id: l.id, productId: l.productId, templateKey: l.templateKey, startsAt: l.startsAt.toISOString(), cartOpenAt: l.cartOpenAt.toISOString(), cartCloseAt: l.cartCloseAt.toISOString(), budgetCap: Number(l.budgetCap), status: l.status }))} />;
}
