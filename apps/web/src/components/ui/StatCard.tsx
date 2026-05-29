'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'cyan' | 'green' | 'orange' | 'red';
  trend?: number;
}

const colorMap = {
  blue:   { icon: 'text-blue-600 dark:text-blue-400',    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',    border: 'border-blue-500/25',   bg: 'bg-blue-500/10'  },
  cyan:   { icon: 'text-cyan-600 dark:text-cyan-400',    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',    border: 'border-cyan-500/25',   bg: 'bg-cyan-500/10'  },
  green:  { icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/25', bg: 'bg-emerald-500/10' },
  orange: { icon: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300', border: 'border-orange-500/25', bg: 'bg-orange-500/10' },
  red:    { icon: 'text-red-600 dark:text-red-400',      badge: 'bg-red-500/15 text-red-700 dark:text-red-300',      border: 'border-red-500/25',    bg: 'bg-red-500/10'   },
};

export function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} p-5`} style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {subtitle && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${c.bg} border ${c.border}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs. semana anterior</span>
        </div>
      )}
    </div>
  );
}
