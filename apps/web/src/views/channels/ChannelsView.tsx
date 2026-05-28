'use client';

import { useState } from 'react';
import { Rocket, Instagram, Facebook, Youtube, Plus, Circle } from 'lucide-react';

interface Channel {
  id: string;
  provider: string;
  handle: string;
  status: string;
  phase: string;
  followers: number;
}

const PROVIDER_ICON: Record<string, React.ElementType> = {
  META: Facebook,
  YOUTUBE: Youtube,
};

const STATUS_COLOR: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-600',
  PROVISIONING: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  WARMING: 'bg-yellow-100 text-yellow-700',
  SHADOWBAN_SUSPECT: 'bg-orange-100 text-orange-700',
  BANNED: 'bg-red-100 text-red-700',
};

const PHASE_LABEL: Record<string, string> = {
  IGNITION: 'Ignição',
  AUTHORITY: 'Autoridade',
  CONVERSION: 'Conversão',
  MATURE: 'Maduro',
};

function CreateChannelForm({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState('META');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, handle }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <h3 className="font-semibold mb-4">Adicionar Canal</h3>
      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Plataforma</label>
          <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="META">Meta (Instagram / Facebook)</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="TIKTOK">TikTok</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Handle / Nome do Canal</label>
          <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@meucanal" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
          {loading ? 'Criando...' : 'Criar Canal'}
        </button>
        <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancelar</button>
      </div>
    </form>
  );
}

export function ChannelsView({ channels }: { channels: Channel[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Canais</h1>
          <p className="text-gray-500 text-sm mt-1">Channel Bootstrap — gestão de presença orgânica</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Adicionar Canal
        </button>
      </div>

      {showForm && <CreateChannelForm onClose={() => setShowForm(false)} />}

      {channels.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <Rocket className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum canal cadastrado</p>
          <p className="text-sm mt-1">Adicione seus canais para começar o Channel Bootstrap.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {channels.map(c => {
            const Icon = PROVIDER_ICON[c.provider] ?? Instagram;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg"><Icon className="w-5 h-5 text-gray-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold">{c.handle}</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{c.provider} · Fase: {PHASE_LABEL[c.phase] ?? c.phase}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{c.followers.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">seguidores</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
