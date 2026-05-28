export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ChannelsView } from '@/views/channels/ChannelsView';

export default async function ChannelsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';
  const channels = await prisma.socialChannel.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  return <ChannelsView channels={channels.map(c => ({ id: c.id, provider: c.provider, handle: c.handle, status: c.status, phase: c.phase, followers: c.followers }))} />;
}
