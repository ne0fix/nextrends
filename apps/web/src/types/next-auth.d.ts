import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      orgId: string | null;
      role: string | null;
      orgName: string | null;
    };
  }
}
