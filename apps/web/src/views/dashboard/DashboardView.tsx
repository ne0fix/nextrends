'use client';

import { Palette, Plug, Megaphone, TrendingUp, Video, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { EngagementChart, CategoryChart, SpendChart, PlatformChart } from '@/components/ui/Charts';
import { VideoCard } from '@/components/ui/VideoCard';
import { VideoPlayerModal } from '@/components/ui/VideoPlayerModal';
import { useState } from 'react';
import type { ViralVideo } from '@/types/viral';
import {
  engagementChartData, categoryChartData, spendTrendData, platformChartData,
} from '@/lib/viralMockData';

interface Stats {
  creatives: number;
  integrations: number;
  campaigns: number;
}

interface Props {
  stats: Stats;
  viralVideos?: ViralVideo[];
  viralSource?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function SectionHeader({
  title, count, icon, source,
}: {
  title: string; count: number; icon: React.ReactNode; source?: string;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        {icon}{title}
      </h2>
      <div className="flex items-center gap-2">
        {source && source !== 'mock' && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border"
            style={{ backgroundColor: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            ▶ YouTube ao vivo
          </span>
        )}
        {(!source || source === 'mock') && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            dados demo
          </span>
        )}
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
          {count} itens
        </span>
      </div>
    </div>
  );
}

export function DashboardView({ stats, viralVideos = [], viralSource = 'mock' }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<ViralVideo | null>(null);

  const totalViews = viralVideos.reduce((s, v) => s + v.views, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Criativos"       value={stats.creatives}           subtitle="gerados"         icon={Palette}    color="blue"   trend={12} />
        <StatCard title="Integrações"      value={stats.integrations}        subtitle="ativas"          icon={Plug}       color="green"  trend={0}  />
        <StatCard title="Campanhas"        value={stats.campaigns}           subtitle="em andamento"    icon={Megaphone}  color="cyan"   trend={8}  />
        <StatCard title="Vídeos Virais"   value={viralVideos.length}         subtitle="monitorados"     icon={Video}      color="red"    trend={31} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EngagementChart data={engagementChartData} />
        <SpendChart data={spendTrendData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart data={categoryChartData} />
        <PlatformChart data={platformChartData} title="Distribuição por Plataforma" />
      </div>

      {/* Viral Videos preview */}
      {viralVideos.length > 0 && (
        <section>
          <SectionHeader
            title="Vídeos Mais Virais"
            count={viralVideos.length}
            source={viralSource}
            icon={<Video className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
          />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {viralVideos.slice(0, 5).map((v, i) => (
              <VideoCard key={v.id} video={v} rank={i + 1} onPlay={setSelectedVideo} />
            ))}
          </div>
          <Link
            href="/discovery/videos"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Ver todos os vídeos virais →
          </Link>
        </section>
      )}

      {/* Setup banner quando sem integração */}
      {stats.integrations === 0 && (
        <div className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Configuração inicial</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Conecte suas integrações (Meta, YouTube, WhatsApp) para começar a criar e publicar campanhas automaticamente.
          </p>
          <Link
            href="/integrations"
            className="inline-block text-sm font-medium px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,var(--accent),#06b6d4)' }}
          >
            Ir para Integrações
          </Link>
        </div>
      )}

      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}
