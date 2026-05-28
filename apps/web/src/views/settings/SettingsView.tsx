'use client';

import { useState } from 'react';
import { Settings, Key, Bell, Shield, Trash2 } from 'lucide-react';

interface Props {
  orgName: string;
  userEmail: string;
  plan: string;
}

export function SettingsView({ orgName, userEmail, plan }: Props) {
  const [name, setName] = useState(orgName);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="grid gap-6 max-w-2xl">
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold">Organização</h2>
          </div>
          <form onSubmit={handleSave} className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nome da organização</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
              <input value={userEmail} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Plano</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium px-3 py-1 bg-brand-100 text-brand-700 rounded-full">{plan}</span>
              </div>
            </div>
            <button type="submit" className={`w-fit text-sm font-medium px-4 py-2 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}>
              {saved ? '✓ Salvo' : 'Salvar alterações'}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold">Segurança</h2>
          </div>
          <div className="grid gap-3 text-sm text-gray-600">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span>2FA (Autenticação em dois fatores)</span>
              <span className="text-amber-600 font-medium">Não configurado</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span>Sessões ativas</span>
              <button className="text-brand-600 hover:underline">Gerenciar</button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Log de auditoria</span>
              <a href="/api/v1/audit" className="text-brand-600 hover:underline">Ver histórico</a>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-4 h-4 text-red-600" />
            <h2 className="font-semibold text-red-700">Zona de Perigo</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Ações irreversíveis. Tenha certeza antes de prosseguir.</p>
          <button className="text-sm font-medium text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
            Revogar todas as integrações
          </button>
        </section>
      </div>
    </div>
  );
}
