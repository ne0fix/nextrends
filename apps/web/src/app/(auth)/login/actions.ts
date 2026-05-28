'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { signIn } from '@/lib/auth';

export async function testLogin(formData: FormData) {
  const email    = String(formData.get('email') || 'admin@nextface.app');
  const password = String(formData.get('password') || '');
  const expected = process.env.TEST_LOGIN_PASSWORD ?? 'nextface2026';

  if (password !== expected) {
    redirect('/login?error=CredentialsSignin');
  }

  // Garante usuário + org + membership no banco
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: 'Admin NextFace', emailVerified: new Date() },
    });
  }

  const membership = await prisma.membership.findFirst({ where: { userId: user.id } });
  if (!membership) {
    const org = await prisma.organization.create({
      data: { name: 'Minha Organização', plan: 'PRO' },
    });
    await prisma.membership.create({
      data: { orgId: org.id, userId: user.id, role: 'OWNER' },
    });
  }

  await signIn('credentials', { email, password, redirectTo: '/dashboard' });
}
