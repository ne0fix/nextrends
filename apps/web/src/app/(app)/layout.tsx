export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (!session.user?.orgId) redirect('/onboarding');

  return (
    <AppShell
      orgName={session.user?.orgName ?? 'Minha Org'}
      userEmail={session.user?.email ?? ''}
    >
      {children}
    </AppShell>
  );
}
