import NextAuth, { type NextAuthResult } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { prisma } from './db';

const TEST_PASSWORD = process.env.TEST_LOGIN_PASSWORD ?? 'nextface2026';

const hasGoogle = !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
const hasResend = !!(process.env.RESEND_API_KEY);

const nextAuth: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Login de teste — acesso rápido sem e-mail (desative em produção real)
    Credentials({
      id: 'test-login',
      name: 'Teste',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password || credentials.password !== TEST_PASSWORD) return null;
        const email = String(credentials.email || 'admin@nextface.app');

        // Garante usuário existe
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, name: 'Admin NextFace', emailVerified: new Date() },
          });
        }

        // Garante org existe
        let membership = await prisma.membership.findFirst({ where: { userId: user.id } });
        if (!membership) {
          const org = await prisma.organization.create({
            data: { name: 'Minha Organização', plan: 'PRO' },
          });
          membership = await prisma.membership.create({
            data: { orgId: org.id, userId: user.id, role: 'OWNER' },
          });
        }

        return { id: user.id, email: user.email!, name: user.name };
      },
    }),
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
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          include: { org: true },
          orderBy: { org: { createdAt: 'asc' } },
        }).catch(() => null);
        token.orgId   = membership?.orgId   ?? null;
        token.role    = membership?.role    ?? null;
        token.orgName = membership?.org?.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id:      String(token.id ?? ''),
          orgId:   token.orgId   as string | null,
          role:    token.role    as string | null,
          orgName: token.orgName as string | null,
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
