import NextAuth, { type NextAuthResult } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { prisma } from './db';

const hasGoogle = !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
const hasResend = !!(process.env.RESEND_API_KEY);

const nextAuth: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(hasGoogle ? [Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    })] : []),
    Resend({
      from: 'noreply@nextface.app',
      apiKey: hasResend ? process.env.RESEND_API_KEY! : 'resend_placeholder',
      sendVerificationRequest: hasResend ? undefined : async ({ url }) => {
        // Dev mode: log the magic link instead of sending email
        console.warn('[NextFace Auth] Magic link:', url);
      },
    }),
  ],
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      if (!user?.id) return session;

      const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        include: { org: true },
        orderBy: { org: { createdAt: 'asc' } },
      }).catch(() => null);

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
  debug: process.env.NODE_ENV === 'development',
});

export const { handlers, auth, signIn, signOut } = nextAuth;
