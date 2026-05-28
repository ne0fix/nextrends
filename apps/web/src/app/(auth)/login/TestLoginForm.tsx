'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function TestLoginForm() {
  const [email, setEmail] = useState('admin@nextface.app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Primeiro garante usuário+org no banco via API
    const setup = await fetch('/api/auth/setup-test-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!setup.ok) {
      const d = await setup.json() as { error?: string };
      setError(d.error ?? 'Senha incorreta.');
      setLoading(false);
      return;
    }

    // Faz login via NextAuth credentials
    const res = await signIn('test-login', {
      email,
      password,
      redirect: false,
    });

    if (res?.error || !res?.ok) {
      setError('Senha incorreta.');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border-2 border-dashed border-yellow-400 bg-yellow-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-yellow-700 text-center">⚡ Acesso Rápido de Teste</p>
      {error && (
        <p className="text-xs text-red-600 text-center bg-red-50 border border-red-200 rounded p-2">{error}</p>
      )}
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="senha"
        className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-yellow-900 font-semibold py-2 rounded-lg text-sm transition-colors"
      >
        {loading ? 'Entrando...' : 'Entrar para testar'}
      </button>
      <p className="text-xs text-yellow-600 text-center">
        Senha: <code className="font-mono font-bold">nextface2026</code>
      </p>
    </form>
  );
}
