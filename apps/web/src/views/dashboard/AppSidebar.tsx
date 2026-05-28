'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Palette, Megaphone, BarChart3,
  Settings, Plug, Rocket, MessageSquare, Users, Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/discovery',    label: 'Descoberta',   icon: Search },
  { href: '/creatives',    label: 'Criativos',    icon: Palette },
  { href: '/campaigns',    label: 'Campanhas',    icon: Megaphone },
  { href: '/analytics',    label: 'Analytics',    icon: BarChart3 },
  { href: '/channels',     label: 'Canais',       icon: Rocket },
  { href: '/messaging',    label: 'Mensagens',    icon: MessageSquare },
  { href: '/community',    label: 'Comunidade',   icon: Users },
  { href: '/launches',     label: 'Lançamentos',  icon: Zap },
  { href: '/integrations', label: 'Integrações',  icon: Plug },
  { href: '/settings',     label: 'Configurações',icon: Settings },
];

interface Props {
  orgName: string;
  userEmail: string;
}

export function AppSidebar({ orgName, userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col h-full bg-brand-950 text-white shrink-0">
      <div className="px-5 py-4 border-b border-brand-800">
        <span className="text-xl font-bold tracking-tight">NextFace</span>
        <p className="text-xs text-brand-300 mt-0.5 truncate">{orgName}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href) && href !== '/dashboard'
                ? 'bg-brand-700 text-white'
                : pathname === href
                ? 'bg-brand-700 text-white'
                : 'text-brand-200 hover:bg-brand-800 hover:text-white',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-brand-800 text-xs text-brand-400 truncate">
        {userEmail}
      </div>
    </aside>
  );
}
