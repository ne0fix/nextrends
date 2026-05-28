'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Play, Trash2 } from 'lucide-react';

interface Flow {
  id: string;
  provider: string;
  name: string;
  steps: unknown[];
  metrics: Record<string, unknown>;
}

export function MessagingView({ flows }: { flows: Flow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('WHATSAPP');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, provider, steps: [] }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <p className="text-gray-500 text-sm mt-1">Funis de mensagens WhatsApp e Telegram</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Novo Fluxo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold mb-4">Criar Fluxo de Mensagens</h3>
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Plataforma</label>
              <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="WHATSAPP">WhatsApp Business</option>
                <option value="TELEGRAM">Telegram</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nome do Fluxo</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Boas-vindas, Recuperação" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={loading} className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{loading ? 'Criando...' : 'Criar'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      {flows.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum fluxo ainda</p>
          <p className="text-sm mt-1">Conecte o WhatsApp Business nas Integrações e crie seu primeiro fluxo.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {flows.map(f => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="p-2 bg-green-50 rounded-lg"><MessageSquare className="w-5 h-5 text-green-600" /></div>
              <div className="flex-1">
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-gray-500">{f.provider} · {f.steps.length} etapas</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><Play className="w-4 h-4 text-green-600" /></button>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
