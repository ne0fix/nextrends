'use client';

import { useState } from 'react';
import { Zap, Plus, Calendar, ShoppingCart } from 'lucide-react';

interface Launch {
  id: string;
  productId: string;
  productName?: string;
  templateKey: string;
  startsAt: string;
  cartOpenAt: string;
  cartCloseAt: string;
  budgetCap: number;
  status: string;
}

const STATUS_COLOR: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  PRELAUNCH: 'bg-purple-100 text-purple-700',
  WARMUP: 'bg-yellow-100 text-yellow-700',
  CART_OPEN: 'bg-green-100 text-green-700',
  CART_CLOSED: 'bg-gray-100 text-gray-600',
  RETROSPECTIVE: 'bg-orange-100 text-orange-700',
};

const TEMPLATE_LABEL: Record<string, string> = {
  express_7: '7 dias — Express',
  standard_14: '14 dias — Padrão',
  long_21: '21 dias — Extenso',
};

function CreateLaunchForm({ products, onClose }: { products: { id: string; name: string }[]; onClose: () => void }) {
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [templateKey, setTemplateKey] = useState('standard_14');
  const [startsAt, setStartsAt] = useState('');
  const [budgetCap, setBudgetCap] = useState('1000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, templateKey, startsAt: new Date(startsAt).toISOString(), budgetCap: Number(budgetCap) }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <h3 className="font-semibold mb-4">Iniciar Lançamento</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Produto</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Template</label>
          <select value={templateKey} onChange={e => setTemplateKey(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {Object.entries(TEMPLATE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Data de início</label>
          <input type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Orçamento (R$)</label>
          <input type="number" value={budgetCap} onChange={e => setBudgetCap(e.target.value)} min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="submit" disabled={loading || !products.length} className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{loading ? 'Criando...' : 'Iniciar Lançamento'}</button>
        <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancelar</button>
      </div>
    </form>
  );
}

export function LaunchesView({ launches, products }: { launches: Launch[]; products: { id: string; name: string }[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lançamentos</h1>
          <p className="text-gray-500 text-sm mt-1">Fórmula de Lançamento — templates 7/14/21 dias</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {showForm && <CreateLaunchForm products={products} onClose={() => setShowForm(false)} />}

      {launches.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum lançamento planejado</p>
          <p className="text-sm mt-1">Inicie um lançamento estruturado com templates prontos.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {launches.map(l => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOR[l.status] ?? 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                    <span className="text-xs text-gray-500">{TEMPLATE_LABEL[l.templateKey] ?? l.templateKey}</span>
                  </div>
                  <p className="font-semibold">{l.productName ?? l.productId}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">R$ {l.budgetCap.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-gray-500 mb-1"><Calendar className="w-3.5 h-3.5" /> Início</div>
                  <p className="font-medium">{new Date(l.startsAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-green-600 mb-1"><ShoppingCart className="w-3.5 h-3.5" /> Carrinho abre</div>
                  <p className="font-medium">{new Date(l.cartOpenAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-red-600 mb-1"><ShoppingCart className="w-3.5 h-3.5" /> Carrinho fecha</div>
                  <p className="font-medium">{new Date(l.cartCloseAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
