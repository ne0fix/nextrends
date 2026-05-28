export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SettingsView } from '@/views/settings/SettingsView';

export default async function SettingsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true, plan: true } });
  return <SettingsView orgName={org?.name ?? ''} userEmail={session?.user?.email ?? ''} plan={org?.plan ?? 'STARTER'} />;
}
