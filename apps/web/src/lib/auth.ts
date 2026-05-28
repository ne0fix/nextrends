import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { prisma } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
    }),
    Resend({
      from: 'noreply@nextface.app',
      apiKey: process.env.RESEND_API_KEY ?? 'dev',
    }),
  ],
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        include: { org: true },
        orderBy: { org: { createdAt: 'asc' } },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          orgId: membership?.orgId ?? null,
          role: membership?.role ?? null,
          orgName: membership?.org?.name ?? null,
        },
      };
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
