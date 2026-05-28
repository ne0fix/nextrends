export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppSidebar } from '@/views/dashboard/AppSidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (!session.user?.orgId) redirect('/onboarding');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar orgName={session.user?.orgName ?? 'Minha Org'} userEmail={session.user?.email ?? ''} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
