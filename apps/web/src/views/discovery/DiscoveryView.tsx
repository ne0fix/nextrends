'use client';

import { TrendingUp, AlertTriangle, RefreshCw, X, Eye, Video } from 'lucide-react';
import Link from 'next/link';
import { useDiscoveryViewModel, type DiscoveryProduct } from './useDiscoveryViewModel';

type Dossier = {
  targetAudience?: string;
  proofPoints?: string[];
  videoId?: string;
  channelTitle?: string;
  viewCount?: number;
  likeCount?: number;
  tags?: string[];
  thumbnailUrl?: string;
  adBody?: string;
  pageName?: string;
  impressions?: { low: number; high: number };
  spend?: { low: number; high: number };
};

const SOURCE_LABEL: Record<string, string> = {
  YOUTUBE: 'YouTube',
  META: 'Meta Ads',
};
const SOURCE_COLOR: Record<string, string> = {
  YOUTUBE: 'bg-red-100 text-red-700',
  META: 'bg-blue-100 text-blue-700',
};

function hotScoreColor(score: number) {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function ProductCard({ product, onSelect }: { product: DiscoveryProduct; onSelect: () => void }) {
  const score = Number(product.hotScore);
  const dossier = product.dossier as Dossier;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-all duration-300 group"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-hover)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      <div className="flex gap-3 p-4 items-start">
        {dossier?.thumbnailUrl && (
          <img
            src={dossier.thumbnailUrl}
            alt=""
            className="w-20 h-14 object-cover rounded-xl shrink-0"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </p>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${SOURCE_COLOR[product.source] ?? 'bg-gray-100 text-gray-600'}`}>
              {SOURCE_LABEL[product.source] ?? product.source}
            </span>
          </div>
          <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{product.niche}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-24 rounded-full h-1.5" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div className={`h-1.5 rounded-full transition-all ${hotScoreColor(score)}`} style={{ width: `${Math.min(100, score)}%` }} />
              </div>
              <span className="text-xs font-bold flex items-center gap-0.5" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-3 h-3" />{score.toFixed(0)}
              </span>
            </div>
            {product.saturation > 70 && (
              <span className="flex items-center gap-1 text-xs text-orange-500">
                <AlertTriangle className="w-3 h-3" /> Saturado
              </span>
            )}
            {dossier?.viewCount != null && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(dossier.viewCount)} views</span>
            )}
          </div>
        </div>
        <Eye className="w-4 h-4 shrink-0 mt-0.5 transition-colors" style={{ color: 'var(--border)' }} />
      </div>
    </button>
  );
}

function DetailPanel({ product, onClose }: { product: DiscoveryProduct; onClose: () => void }) {
  const score = Number(product.hotScore);
  const dossier = product.dossier as Dossier;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="relative z-50 w-full max-w-md border-l flex flex-col h-full overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SOURCE_COLOR[product.source] ?? 'bg-gray-100 text-gray-600'}`}>
              {SOURCE_LABEL[product.source] ?? product.source}
            </span>
            <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{product.niche}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 flex-1 space-y-5">
          {dossier?.thumbnailUrl && (
            <img src={dossier.thumbnailUrl} alt="" className="w-full rounded-2xl object-cover max-h-48" style={{ backgroundColor: 'var(--bg-elevated)' }} />
          )}

          <h2 className="font-bold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>{product.name}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Hot Score</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
                  <div className={`h-2 rounded-full ${hotScoreColor(score)}`} style={{ width: `${Math.min(100, score)}%` }} />
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{score.toFixed(0)}</span>
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Saturação</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
                  <div className={`h-2 rounded-full ${product.saturation > 70 ? 'bg-orange-400' : 'bg-blue-400'}`} style={{ width: `${product.saturation}%` }} />
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{product.saturation}%</span>
              </div>
            </div>
          </div>

          {/* YouTube */}
          {product.source === 'YOUTUBE' && dossier?.viewCount != null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-red-50">
                <p className="text-xs text-red-400 mb-0.5">Visualizações</p>
                <p className="text-lg font-bold text-red-700">{fmt(dossier.viewCount)}</p>
              </div>
              <div className="rounded-xl p-3 bg-red-50">
                <p className="text-xs text-red-400 mb-0.5">Curtidas</p>
                <p className="text-lg font-bold text-red-700">{fmt(dossier.likeCount ?? 0)}</p>
              </div>
              {dossier.channelTitle && (
                <div className="col-span-2 rounded-xl p-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Canal</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dossier.channelTitle}</p>
                </div>
              )}
              {dossier.videoId && (
                <div className="col-span-2">
                  <a href={`https://youtube.com/watch?v=${dossier.videoId}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
                    Abrir no YouTube →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          {product.source === 'META' && (
            <div className="space-y-3">
              {dossier?.pageName && (
                <div className="rounded-xl p-3 bg-blue-50">
                  <p className="text-xs text-blue-400 mb-0.5">Página</p>
                  <p className="text-sm font-medium text-blue-800">{dossier.pageName}</p>
                </div>
              )}
              {dossier?.impressions && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 bg-blue-50">
                    <p className="text-xs text-blue-400 mb-0.5">Impressões est.</p>
                    <p className="text-sm font-bold text-blue-700">{fmt(dossier.impressions.low)}–{fmt(dossier.impressions.high)}</p>
                  </div>
                  {dossier.spend && dossier.spend.high > 0 && (
                    <div className="rounded-xl p-3 bg-blue-50">
                      <p className="text-xs text-blue-400 mb-0.5">Gasto est.</p>
                      <p className="text-sm font-bold text-blue-700">R${fmt(dossier.spend.low)}–R${fmt(dossier.spend.high)}</p>
                    </div>
                  )}
                </div>
              )}
              {dossier?.adBody && (
                <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Copy do anúncio</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{dossier.adBody}</p>
                </div>
              )}
            </div>
          )}

          {dossier?.targetAudience && (
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Audiência-alvo</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{dossier.targetAudience}</p>
            </div>
          )}

          {(dossier?.proofPoints?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Prova social</p>
              <ul className="space-y-1">
                {dossier!.proofPoints!.map((pt, i) => (
                  <li key={i} className="text-sm flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-green-500 mt-0.5">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.source === 'YOUTUBE' && (dossier?.tags?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {dossier!.tags!.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t sticky bottom-0" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <a
            href="/creatives"
            className="block w-full text-center text-white font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 text-sm"
            style={{ background: 'linear-gradient(135deg,var(--accent),#06b6d4)' }}
          >
            Gerar Criativo com este produto
          </a>
        </div>
      </aside>
    </div>
  );
}

export function DiscoveryView({ products: initialProducts }: { products: DiscoveryProduct[] }) {
  const vm = useDiscoveryViewModel(initialProducts);
  const SOURCES = ['all', 'YOUTUBE', 'META'];
  const SOURCE_NAMES: Record<string, string> = { all: 'Todos', YOUTUBE: 'YouTube', META: 'Meta Ads' };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Descoberta de Produtos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Produtos com maior potencial de venda agora.
            {vm.totalCount > 0 && <span className="ml-2">{vm.totalCount} catalogados</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/discovery/videos"
            className="flex items-center gap-2 border text-sm font-medium px-3 py-2 rounded-xl transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Video className="w-4 h-4" />
            Vídeos Virais
          </Link>
          <button
            onClick={vm.scan}
            disabled={vm.isScanning}
            className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,var(--accent),#06b6d4)' }}
          >
            <RefreshCw className={`w-4 h-4 ${vm.isScanning ? 'animate-spin' : ''}`} />
            {vm.isScanning ? 'Buscando…' : 'Descobrir Agora'}
          </button>
        </div>
      </div>

      {/* Scan result */}
      {vm.scanResult && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${vm.scanResult.errors.length > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
          {vm.scanResult.indexed > 0
            ? `✓ ${vm.scanResult.indexed} produto${vm.scanResult.indexed !== 1 ? 's' : ''} descoberto${vm.scanResult.indexed !== 1 ? 's' : ''}`
            : 'Nenhum produto novo encontrado.'}
          {vm.scanResult.errors.length > 0 && (
            <span className="ml-2 text-orange-500 text-xs">
              ({vm.scanResult.errors[0]?.slice(0, 60)})
            </span>
          )}
        </div>
      )}

      {/* Source filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {SOURCES.map(s => (
          <button
            key={s}
            onClick={() => vm.setSourceFilter(s)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
            style={vm.sourceFilter === s ? {
              backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)',
            } : {
              backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border)',
            }}
          >
            {SOURCE_NAMES[s] ?? s}
          </button>
        ))}
      </div>

      {/* Niche filters */}
      {vm.niches.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => vm.setNicheFilter('all')}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
            style={vm.nicheFilter === 'all' ? {
              backgroundColor: 'var(--text-primary)', color: 'var(--bg-surface)', borderColor: 'var(--text-primary)',
            } : {
              backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border)',
            }}
          >
            Todos nichos
          </button>
          {vm.niches.map(n => (
            <button
              key={n}
              onClick={() => vm.setNicheFilter(n)}
              className="text-xs font-medium px-3 py-1.5 rounded-full capitalize border transition-all"
              style={vm.nicheFilter === n ? {
                backgroundColor: 'var(--text-primary)', color: 'var(--bg-surface)', borderColor: 'var(--text-primary)',
              } : {
                backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Product list */}
      <div className="space-y-3">
        {vm.products.length === 0 && !vm.isScanning && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum produto ainda</p>
            <p className="text-sm mt-1">Clique em <strong>Descobrir Agora</strong> para buscar produtos virais.</p>
          </div>
        )}
        {vm.isScanning && vm.products.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Buscando produtos no YouTube e Meta Ads…</p>
          </div>
        )}
        {vm.products.map(p => (
          <ProductCard key={p.id} product={p} onSelect={() => vm.setSelected(p)} />
        ))}
      </div>

      {vm.selected && <DetailPanel product={vm.selected} onClose={() => vm.setSelected(null)} />}
    </div>
  );
}
