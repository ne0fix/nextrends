export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string };

  const expected = process.env.TEST_LOGIN_PASSWORD ?? 'nextface2026';
  if (password !== expected) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  }

  const emailStr = email || 'admin@nextface.app';

  let user = await prisma.user.findUnique({ where: { email: emailStr } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: emailStr, name: 'Admin NextFace', emailVerified: new Date() },
    });
  }

  const existing = await prisma.membership.findFirst({ where: { userId: user.id } });
  if (!existing) {
    const org = await prisma.organization.create({
      data: { name: 'Minha Organização', plan: 'PRO' },
    });
    await prisma.membership.create({
      data: { orgId: org.id, userId: user.id, role: 'OWNER' },
    });
  }

  return NextResponse.json({ ok: true });
}
