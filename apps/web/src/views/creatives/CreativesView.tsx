'use client';

import { useState } from 'react';
import { Palette, Plus, Wand2 } from 'lucide-react';

type Creative = {
  id: string;
  format: string;
  hookType: string;
  angle: string;
  status: string;
  riskScore: unknown;
  createdAt: Date;
  assets: unknown;
  product: { name: string } | null;
};

type Product = { id: string; name: string; niche: string };

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
};

export function CreativesView({ creatives, products }: { creatives: Creative[]; products: Product[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Criativos</h1>
          <p className="text-gray-500 text-sm mt-1">{creatives.length} criativos gerados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Gerar Criativo
        </button>
      </div>

      {showForm && <GenerateCreativeForm products={products} onClose={() => setShowForm(false)} />}

      <div className="grid gap-3">
        {creatives.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nenhum criativo ainda. Clique em "Gerar Criativo" para começar.
          </div>
        )}
        {creatives.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{c.product?.name ?? 'Produto não encontrado'}</p>
                <p className="text-sm text-gray-500 mt-0.5">{c.format} · Hook: {c.hookType} · {c.angle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[c.status] ?? ''}`}>
                  {c.status}
                </span>
                {c.riskScore != null && (
                  <span className={`text-xs px-2 py-1 rounded-full ${Number(c.riskScore) > 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    Risk {Number(c.riskScore)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerateCreativeForm({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = { productId: fd.get('productId'), format: fd.get('format'), channel: fd.get('channel') };
    try {
      const res = await fetch('/api/v1/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
      <Wand2 className="w-5 h-5 text-green-600" />
      <p className="text-green-800 font-medium">Criativo gerado com sucesso!</p>
      <button onClick={() => { setSuccess(false); onClose(); }} className="ml-auto text-sm text-green-600 underline">Fechar</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4">
      <h2 className="font-semibold text-lg flex items-center gap-2"><Wand2 className="w-5 h-5 text-brand-600" /> Gerar Criativo com IA</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
        <select name="productId" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="">Selecione um produto</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.niche})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
          <select name="format" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
            <option value="COPY">Copy (texto)</option>
            <option value="IMAGE">Imagem</option>
            <option value="VIDEO_SHORT">Vídeo curto</option>
            <option value="CAROUSEL">Carrossel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
          <select name="channel" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
            <option value="IG_REELS">Instagram Reels</option>
            <option value="META_ADS">Meta Ads</option>
            <option value="TIKTOK_ORGANIC">TikTok Orgânico</option>
            <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
            <option value="FACEBOOK_GROUP">Grupo Facebook</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors">
          {loading ? 'Gerando...' : 'Gerar com IA'}
        </button>
      </div>
    </form>
  );
}
