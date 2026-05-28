export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { testLogin } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.orgId) redirect('/dashboard');

  const { error } = await searchParams;
  const hasGoogle = !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#171d55] to-[#2135d6]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-5">

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2a47e9] mb-3">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">NextFace</h1>
          <p className="text-gray-500 text-sm mt-1">Marketing IA para Infoprodutos</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
            {error === 'CredentialsSignin' ? 'Senha incorreta.' : `Erro: ${error}`}
          </div>
        )}

        {/* Login de TESTE */}
        <form action={testLogin} className="rounded-xl border-2 border-dashed border-yellow-400 bg-yellow-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-yellow-700 text-center">⚡ Acesso Rápido de Teste</p>
          <input
            name="email"
            type="email"
            defaultValue="admin@nextface.app"
            className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            name="password"
            type="password"
            placeholder="senha"
            className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            Entrar para testar
          </button>
          <p className="text-xs text-yellow-600 text-center">
            Senha: <code className="font-mono font-bold">nextface2026</code>
          </p>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-400">ou e-mail</span>
          </div>
        </div>

        <form action="/api/auth/signin/resend" method="POST" className="space-y-3">
          <input name="callbackUrl" type="hidden" value="/dashboard" />
          <input
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-[#2a47e9] hover:bg-[#2135d6] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Enviar magic link
          </button>
        </form>

        {hasGoogle && (
          <a
            href="/api/auth/signin/google?callbackUrl=/dashboard"
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </a>
        )}
      </div>
    </div>
  );
}
