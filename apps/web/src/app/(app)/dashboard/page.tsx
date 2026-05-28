import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardView } from '@/views/dashboard/DashboardView';

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session!.user.orgId!;

  const [creativesCount, integrationsCount, campaignsCount] = await Promise.all([
    prisma.creative.count({ where: { orgId } }),
    prisma.integration.count({ where: { orgId, status: 'CONNECTED' } }),
    prisma.campaign.count({ where: { orgId, status: 'ACTIVE' } }),
  ]);

  return (
    <DashboardView
      stats={{
        creatives: creativesCount,
        integrations: integrationsCount,
        campaigns: campaignsCount,
      }}
    />
  );
}
