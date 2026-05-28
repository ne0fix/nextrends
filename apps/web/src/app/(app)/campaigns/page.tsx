export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CampaignsView } from '@/views/campaigns/CampaignsView';

export default async function CampaignsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';

  const campaigns = await prisma.campaign.findMany({
    where: { orgId },
    orderBy: { status: 'asc' },
    include: { _count: { select: { adSets: true } } },
  });

  return (
    <CampaignsView
      campaigns={campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        budgetDaily: Number(c.budgetDaily),
        objective: c.objective,
        channel: c.channel,
        _count: c._count,
      }))}
    />
  );
}
