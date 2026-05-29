'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp, LayoutDashboard, Search, Palette, Megaphone,
  BarChart3, Settings, Plug, Rocket, MessageSquare, Users, Zap, Video,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/discovery',    label: 'Descoberta',      icon: Search },
  { href: '/discovery/videos', label: 'Vídeos Virais', icon: Video },
  { href: '/creatives',    label: 'Criativos',       icon: Palette },
  { href: '/campaigns',    label: 'Campanhas',       icon: Megaphone },
  { href: '/analytics',    label: 'Analytics',       icon: BarChart3 },
  { href: '/channels',     label: 'Canais',          icon: Rocket },
  { href: '/messaging',    label: 'Mensagens',       icon: MessageSquare },
  { href: '/community',    label: 'Comunidade',      icon: Users },
  { href: '/launches',     label: 'Lançamentos',     icon: Zap },
  { href: '/integrations', label: 'Integrações',     icon: Plug },
];

const PLATFORMS = [
  { name: 'Meta Ads',  emoji: '📱', active: true  },
  { name: 'YouTube',   emoji: '▶️',  active: true  },
  { name: 'TikTok',    emoji: '🎵', active: false },
  { name: 'WhatsApp',  emoji: '💬', active: false },
];

interface Props {
  orgName: string;
  userEmail: string;
}

export function AppSidebar({ orgName, userEmail }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 border-r"
      style={{ width: '240px', backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), #06b6d4)' }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>NextFace</h1>
            <p className="text-[10px] truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
              {orgName}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-[9px] uppercase tracking-widest px-3 mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          Menu
        </p>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={active ? {
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    borderColor: 'var(--accent)',
                  } : {
                    color: 'var(--text-secondary)',
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {href === '/discovery/videos' && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white bg-red-500">
                      HOT
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Plataformas monitoradas */}
        <div className="mt-5">
          <p className="text-[9px] uppercase tracking-widest px-3 mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
            Monitorando
          </p>
          <div className="space-y-1.5 px-1">
            {PLATFORMS.map(p => (
              <div
                key={p.name}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <span className="text-base">{p.emoji}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Link
          href="/settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border border-transparent"
          style={{ color: 'var(--text-muted)' }}
        >
          <Settings className="w-4 h-4" />
          <span className="truncate text-xs">{userEmail}</span>
        </Link>
      </div>
    </aside>
  );
}
