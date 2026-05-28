'use client';

import { Megaphone, Play, Pause, TrendingUp, DollarSign } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  budgetDaily: number;
  objective: string;
  channel: string;
  _count: { adSets: number };
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

export function CampaignsView({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campanhas</h1>
          <p className="text-gray-500 text-sm mt-1">{campaigns.length} campanhas</p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma campanha ainda</p>
          <p className="text-sm mt-1">Conecte sua conta de anúncios do Meta para sincronizar campanhas.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                  <span className="text-xs text-gray-400">{c.channel.replace('_', ' ')}</span>
                </div>
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{c.objective} · {c._count.adSets} conjuntos de anúncios</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    R$ {Number(c.budgetDaily).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-400">orçamento/dia</p>
                </div>
                {c.status === 'ACTIVE'
                  ? <Pause className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 transition-colors" />
                  : <Play className="w-4 h-4 text-gray-400 cursor-pointer hover:text-green-500 transition-colors" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
