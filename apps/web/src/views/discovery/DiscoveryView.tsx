'use client';

import { TrendingUp, AlertTriangle, RefreshCw, X, Eye } from 'lucide-react';
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
      className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all group"
    >
      <div className="flex gap-3 items-start">
        {dossier?.thumbnailUrl && (
          <img
            src={dossier.thumbnailUrl}
            alt=""
            className="w-20 h-14 object-cover rounded-lg shrink-0 bg-gray-100"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</p>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${SOURCE_COLOR[product.source] ?? 'bg-gray-100 text-gray-600'}`}>
              {SOURCE_LABEL[product.source] ?? product.source}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1 capitalize">{product.niche}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${hotScoreColor(score)}`}
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {score.toFixed(0)}
              </span>
            </div>

            {product.saturation > 70 && (
              <span className="flex items-center gap-1 text-xs text-orange-500">
                <AlertTriangle className="w-3 h-3" /> Saturado
              </span>
            )}

            {dossier?.viewCount != null && (
              <span className="text-xs text-gray-400">{fmt(dossier.viewCount)} views</span>
            )}
            {dossier?.impressions && (
              <span className="text-xs text-gray-400">
                {fmt(dossier.impressions.low)}–{fmt(dossier.impressions.high)} imp.
              </span>
            )}
          </div>
        </div>
        <Eye className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
      </div>
    </button>
  );
}

function DetailPanel({ product, onClose }: { product: DiscoveryProduct; onClose: () => void }) {
  const score = Number(product.hotScore);
  const dossier = product.dossier as Dossier;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SOURCE_COLOR[product.source] ?? 'bg-gray-100 text-gray-600'}`}>
              {SOURCE_LABEL[product.source] ?? product.source}
            </span>
            <span className="text-xs text-gray-400 capitalize">{product.niche}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex-1 space-y-5">
          {dossier?.thumbnailUrl && (
            <img src={dossier.thumbnailUrl} alt="" className="w-full rounded-xl object-cover max-h-48 bg-gray-100" />
          )}

          <div>
            <h2 className="font-bold text-base leading-snug">{product.name}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Hot Score</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${hotScoreColor(score)}`} style={{ width: `${Math.min(100, score)}%` }} />
                </div>
                <span className="text-sm font-bold">{score.toFixed(0)}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Saturação</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${product.saturation > 70 ? 'bg-orange-400' : 'bg-blue-400'}`} style={{ width: `${product.saturation}%` }} />
                </div>
                <span className="text-sm font-bold">{product.saturation}%</span>
              </div>
            </div>
          </div>

          {/* YouTube específico */}
          {product.source === 'YOUTUBE' && dossier?.viewCount != null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-red-400 mb-0.5">Visualizações</p>
                <p className="text-lg font-bold text-red-700">{fmt(dossier.viewCount)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-red-400 mb-0.5">Curtidas</p>
                <p className="text-lg font-bold text-red-700">{fmt(dossier.likeCount ?? 0)}</p>
              </div>
              {dossier.channelTitle && (
                <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Canal</p>
                  <p className="text-sm font-medium">{dossier.channelTitle}</p>
                </div>
              )}
              {dossier.videoId && (
                <div className="col-span-2">
                  <a
                    href={`https://youtube.com/watch?v=${dossier.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Abrir no YouTube →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Meta específico */}
          {product.source === 'META' && (
            <div className="space-y-3">
              {dossier?.pageName && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-400 mb-0.5">Página</p>
                  <p className="text-sm font-medium">{dossier.pageName}</p>
                </div>
              )}
              {dossier?.impressions && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-0.5">Impressões est.</p>
                    <p className="text-sm font-bold text-blue-700">
                      {fmt(dossier.impressions.low)}–{fmt(dossier.impressions.high)}
                    </p>
                  </div>
                  {dossier.spend && dossier.spend.high > 0 && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-400 mb-0.5">Gasto est.</p>
                      <p className="text-sm font-bold text-blue-700">
                        R${fmt(dossier.spend.low)}–R${fmt(dossier.spend.high)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {dossier?.adBody && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Copy do anúncio</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{dossier.adBody}</p>
                </div>
              )}
            </div>
          )}

          {/* Audiência */}
          {dossier?.targetAudience && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Audiência-alvo</p>
              <p className="text-sm text-gray-700">{dossier.targetAudience}</p>
            </div>
          )}

          {/* Proof points */}
          {(dossier?.proofPoints?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Prova social</p>
              <ul className="space-y-1">
                {dossier!.proofPoints!.map((pt, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags YouTube */}
          {product.source === 'YOUTUBE' && (dossier?.tags?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {dossier!.tags!.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t sticky bottom-0 bg-white">
          <a
            href="/creatives"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
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
  const NICHE_LABELS: Record<string, string> = {
    all: 'Todos',
    YOUTUBE: 'YouTube',
    META: 'Meta Ads',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Descoberta de Produtos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Produtos com maior potencial de venda agora.
            {vm.totalCount > 0 && <span className="ml-2 text-gray-400">{vm.totalCount} catalogados</span>}
          </p>
        </div>
        <button
          onClick={vm.scan}
          disabled={vm.isScanning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${vm.isScanning ? 'animate-spin' : ''}`} />
          {vm.isScanning ? 'Buscando…' : 'Descobrir Agora'}
        </button>
      </div>

      {/* Scan result banner */}
      {vm.scanResult && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${vm.scanResult.errors.length > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
          {vm.scanResult.indexed > 0
            ? `✓ ${vm.scanResult.indexed} produto${vm.scanResult.indexed !== 1 ? 's' : ''} descoberto${vm.scanResult.indexed !== 1 ? 's' : ''}`
            : 'Nenhum produto novo encontrado.'
          }
          {vm.scanResult.errors.length > 0 && (
            <span className="ml-2 text-orange-500 text-xs">
              ({vm.scanResult.errors.length} erro{vm.scanResult.errors.length !== 1 ? 's' : ''}: {vm.scanResult.errors[0]?.slice(0, 60)})
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
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${vm.sourceFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {NICHE_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {/* Niche filters */}
      {vm.niches.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => vm.setNicheFilter('all')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${vm.nicheFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos nichos
          </button>
          {vm.niches.map(n => (
            <button
              key={n}
              onClick={() => vm.setNicheFilter(n)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${vm.nicheFilter === n ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Product list */}
      <div className="space-y-3">
        {vm.products.length === 0 && !vm.isScanning && (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum produto ainda</p>
            <p className="text-sm mt-1">Clique em <strong>Descobrir Agora</strong> para buscar produtos virais no YouTube e Meta.</p>
          </div>
        )}
        {vm.isScanning && vm.products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Buscando produtos no YouTube e Meta Ads…</p>
          </div>
        )}
        {vm.products.map(p => (
          <ProductCard key={p.id} product={p} onSelect={() => vm.setSelected(p)} />
        ))}
      </div>

      {/* Detail panel */}
      {vm.selected && (
        <DetailPanel product={vm.selected} onClose={() => vm.setSelected(null)} />
      )}
    </div>
  );
}
