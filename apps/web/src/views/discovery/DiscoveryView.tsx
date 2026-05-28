'use client';

import { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

type Product = {
  id: string;
  source: string;
  name: string;
  niche: string;
  hotScore: unknown;
  saturation: number;
  dossier: unknown;
  updatedAt: Date;
};

export function DiscoveryView({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Descoberta de Produtos</h1>
      <p className="text-gray-500 text-sm mb-6">Produtos com maior potencial de venda agora.</p>

      <div className="grid gap-3">
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhum produto catalogado ainda. O sistema carregará produtos automaticamente.
          </div>
        )}
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{p.source} · {p.niche}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 text-green-700 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  {Number(p.hotScore).toFixed(0)}
                </div>
                {p.saturation > 70 && (
                  <span className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                    <AlertTriangle className="w-3 h-3" /> Saturado
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
