import { Palette, Plug, Megaphone } from 'lucide-react';

interface Stats {
  creatives: number;
  integrations: number;
  campaigns: number;
}

export function DashboardView({ stats }: { stats: Stats }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Palette} label="Criativos" value={stats.creatives} color="bg-purple-100 text-purple-700" />
        <StatCard icon={Plug} label="Integrações ativas" value={stats.integrations} color="bg-green-100 text-green-700" />
        <StatCard icon={Megaphone} label="Campanhas ativas" value={stats.campaigns} color="bg-blue-100 text-blue-700" />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <h2 className="font-semibold text-yellow-800 mb-1">Configuração inicial</h2>
        <p className="text-sm text-yellow-700">
          Conecte suas integrações (Meta, YouTube, WhatsApp) para começar a criar e publicar campanhas automaticamente.
        </p>
        <a
          href="/integrations"
          className="mt-3 inline-block bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Ir para Integrações
        </a>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
