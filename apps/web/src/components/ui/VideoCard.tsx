'use client';

import { ViralVideo } from '@/types/viral';
import { Play, Heart, Eye, Share2, TrendingUp } from 'lucide-react';
import { SocialBadge, MarketplaceBadge } from '@/components/ui/PlatformBadge';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface Props {
  video: ViralVideo;
  rank: number;
  onPlay: (video: ViralVideo) => void;
}

export function VideoCard({ video, rank, onPlay }: Props) {
  const scoreColor = video.trendScore >= 97 ? '#10b981' : video.trendScore >= 90 ? '#f59e0b' : 'var(--accent)';

  return (
    <div
      onClick={() => onPlay(video)}
      className="group cursor-pointer rounded-2xl overflow-hidden border flex flex-col transition-all duration-300 hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
        height: '380px',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-hover)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden shrink-0" style={{ height: '247px' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/400x600/2a47e9/ffffff?text=${encodeURIComponent(video.title.slice(0, 15))}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        {/* Rank + platform + duration */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">#{rank}</span>
          <div className="flex items-center gap-1.5">
            <SocialBadge platform={video.platform} size="sm" />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white">
              {video.duration}
            </span>
          </div>
        </div>

        {/* Trend score */}
        <div className="absolute top-9 right-2.5">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60">
            <TrendingUp className="w-2.5 h-2.5" style={{ color: scoreColor }} />
            <span className="text-[9px] font-bold" style={{ color: scoreColor }}>{video.trendScore}</span>
          </div>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/70 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
            <Eye className="w-3 h-3" />{fmt(video.views)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
            <Heart className="w-3 h-3" />{fmt(video.likes)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
            <Share2 className="w-3 h-3" />{fmt(video.shares)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 min-h-0">
        <p className="text-xs font-semibold leading-snug line-clamp-2 mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {video.title}
        </p>
        <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{video.author}</p>

        {video.linkedProduct ? (
          <div
            className="mt-auto flex items-center gap-2 p-2 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <MarketplaceBadge platform={video.linkedProduct.marketplace} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{video.linkedProduct.name}</p>
              {video.linkedProduct.price > 0 && (
                <p className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
                  R${video.linkedProduct.price.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
            <a
              href={video.linkedProduct.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[9px] px-2 py-0.5 rounded-full font-semibold text-white"
              style={{ background: 'var(--accent)' }}
              onClick={e => e.stopPropagation()}
            >
              Ver
            </a>
          </div>
        ) : (
          <div className="mt-auto flex flex-wrap gap-1">
            {video.hashtags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
