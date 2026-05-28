import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { IntegrationsView } from '@/views/integrations/IntegrationsView';

export default async function IntegrationsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';

  const integrations = await prisma.integration.findMany({
    where: { orgId },
    select: {
      id: true, provider: true, status: true,
      externalAccountIds: true, lastHealthOk: true,
      lastHealthCheckAt: true, expiresAt: true,
    },
  });

  return <IntegrationsView integrations={integrations} />;
}
