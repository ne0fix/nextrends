'use client';

import { useState, useCallback } from 'react';
import { VideoCard } from '@/components/ui/VideoCard';
import { VideoPlayerModal } from '@/components/ui/VideoPlayerModal';
import { VideoSearchBar } from '@/components/ui/VideoSearchBar';
import type { ViralVideo } from '@/types/viral';
import { Video, RefreshCw } from 'lucide-react';

interface Props {
  initialVideos: ViralVideo[];
  initialSource: string;
}

function matchesCategory(cat: string, filter: string): boolean {
  if (filter === 'Todos') return true;
  const catWord = cat.toLowerCase().split(' ')[0] ?? '';
  return cat.toLowerCase().includes(filter.toLowerCase()) ||
    filter.toLowerCase().includes(catWord);
}

export function ViralVideosView({ initialVideos, initialSource }: Props) {
  const [videos, setVideos]             = useState<ViralVideo[]>(initialVideos);
  const [source, setSource]             = useState(initialSource);
  const [loading, setLoading]           = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeCategory, setCategory]   = useState('Todos');
  const [selected, setSelected]         = useState<ViralVideo | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/discovery/videos');
      const data = await res.json();
      if (data?.data?.length) {
        setVideos(data.data);
        setSource(data.source ?? 'mock');
      }
    } catch { /* mantém dados anteriores */ }
    finally { setLoading(false); }
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = videos.filter(v => {
    const matchCat = matchesCategory(v.category, activeCategory);
    const matchQ = !q ||
      v.title.toLowerCase().includes(q) ||
      v.author.toLowerCase().includes(q) ||
      v.hashtags.some(h => h.toLowerCase().includes(q)) ||
      v.linkedProduct?.name.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Video className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Vídeos Virais
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} vídeos · {source !== 'mock' ? '▶ YouTube ao vivo' : 'dados demo'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {source !== 'mock' && (
            <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold border"
              style={{ backgroundColor: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              YouTube API
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg,var(--accent),#06b6d4)' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Buscando…' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <VideoSearchBar
        onSearch={setSearchQuery}
        onFilter={setCategory}
        onRefresh={refresh}
        loading={loading}
        activeCategory={activeCategory}
      />

      {/* Grid */}
      {loading && filtered.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse border" style={{ height: '380px', backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nenhum resultado encontrado</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tente outro termo ou categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((v, i) => (
            <VideoCard key={v.id} video={v} rank={i + 1} onPlay={setSelected} />
          ))}
        </div>
      )}

      <VideoPlayerModal video={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
