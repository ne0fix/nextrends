'use client';

import { useState } from 'react';
import { AppSidebar } from '@/views/dashboard/AppSidebar';
import { useTheme } from '@/components/ThemeProvider';
import { usePathname } from 'next/navigation';
import { Menu, TrendingUp, Bell, Sun, Moon } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/discovery':          'Descoberta de Produtos',
  '/discovery/videos':   'Vídeos Virais',
  '/creatives':          'Criativos',
  '/campaigns':          'Campanhas',
  '/analytics':          'Analytics',
  '/channels':           'Canais',
  '/messaging':          'Mensagens',
  '/community':          'Comunidade',
  '/launches':           'Lançamentos',
  '/integrations':       'Integrações',
  '/settings':           'Configurações',
};

interface Props {
  orgName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AppShell({ orgName, userEmail, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  const pageLabel =
    Object.entries(PAGE_LABELS)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? 'NextFace';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Sidebar desktop */}
      <AppSidebar orgName={orgName} userEmail={userEmail} />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-60 border-r"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <AppSidebar orgName={orgName} userEmail={userEmail} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-14 border-b flex items-center px-4 gap-3 shrink-0"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="lg:hidden w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent), #06b6d4)' }}
            >
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {pageLabel}
            </h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              IA Ativa
            </div>

            <button
              onClick={toggle}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="relative p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
          {/* Background glow */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
              style={{ backgroundColor: 'var(--accent-soft)' }} />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-50"
              style={{ backgroundColor: 'rgba(6,182,212,0.04)' }} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
