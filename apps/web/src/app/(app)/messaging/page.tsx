export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MessagingView } from '@/views/messaging/MessagingView';

export default async function MessagingPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';
  const flows = await prisma.messagingFlow.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  return <MessagingView flows={flows.map(f => ({ id: f.id, provider: f.provider, name: f.name, steps: f.steps as unknown[], metrics: f.metrics as Record<string, unknown> }))} />;
}
