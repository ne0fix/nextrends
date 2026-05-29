'use client';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/types/viral';

const COLORS = ['#2a47e9', '#06b6d4', '#6892f8', '#10b981', '#f59e0b'];

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl border text-xs"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      {label && <p className="mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  );
}

const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 };
const gridStyle = { stroke: 'var(--border)', strokeOpacity: 0.6 };

export function EngagementChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Engajamento ao Longo do Tempo</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2a47e9" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2a47e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
          <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" name="Criativos" stroke="#2a47e9" fill="url(#gradBlue)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="secondary" name="Orgânico" stroke="#06b6d4" fill="url(#gradCyan)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Vídeos por Categoria</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendChart({ data }: { data: ChartDataPoint[] }) {
  function fmt(v: number) {
    if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}K`;
    return `R$${v}`;
  }
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Investimento em Ads (Semanal)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
          <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
          <Tooltip content={<CustomTooltip />} formatter={v => [fmt(Number(v))]} />
          <Bar dataKey="value" name="Máximo" fill="#2a47e9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="secondary" name="Mínimo" fill="#6892f8" radius={[4, 4, 0, 0]} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlatformChart({ data, title }: { data: ChartDataPoint[]; title?: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{title ?? 'Distribuição por Plataforma'}</h3>
      <div className="space-y-3 mt-2">
        {data.map((item, i) => (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.value / max) * 100}%`, background: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2" style={{ borderColor: 'var(--border)' }}>
        {data.map((item, i) => (
          <div key={item.name} className="text-center">
            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: COLORS[i] }} />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.name}</p>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
