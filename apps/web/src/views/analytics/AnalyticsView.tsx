'use client';

import { TrendingUp, DollarSign, MousePointer, Target, Zap, BarChart3 } from 'lucide-react';

interface AnalyticsSummary {
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
}

interface OodaAction { id: string; type: string; targetType: string; reason: string; executedAt: string | null }
interface CampaignStat { status: string; count: number }
interface TopCreative { id: string; angle: string; hookType: string; format: string; riskScore: number | null }

interface Props {
  summary: AnalyticsSummary;
  recentActions: OodaAction[];
  campaignStats: CampaignStat[];
  topCreatives: TopCreative[];
  days: number;
}

function MetricCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const ACTION_COLOR: Record<string, string> = {
  KILL: 'bg-red-100 text-red-700',
  SCALE: 'bg-green-100 text-green-700',
  ROTATE: 'bg-blue-100 text-blue-700',
  MUTATE: 'bg-purple-100 text-purple-700',
};

export function AnalyticsView({ summary, recentActions, campaignStats, topCreatives, days }: Props) {
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const fmtCurrency = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const hasData = summary.impressions > 0 || summary.spend > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Últimos {days} dias</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <a key={d} href={`?days=${d}`} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${d === days ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 hover:border-brand-400'}`}>
              {d}d
            </a>
          ))}
        </div>
      </div>

      {!hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">Sem dados de métricas ainda</p>
          <p>Conecte suas campanhas do Meta e aguarde a sincronização das métricas.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Gasto" value={fmtCurrency(summary.spend)} icon={DollarSign} color="bg-red-50 text-red-600" />
        <MetricCard label="Receita" value={fmtCurrency(summary.revenue)} icon={TrendingUp} color="bg-green-50 text-green-600" />
        <MetricCard label="ROAS" value={`${fmt(summary.roas)}x`} sub="retorno sobre gasto" icon={BarChart3} color="bg-blue-50 text-blue-600" />
        <MetricCard label="CTR" value={`${fmt(summary.ctr)}%`} sub={`${summary.clicks.toLocaleString()} cliques`} icon={MousePointer} color="bg-purple-50 text-purple-600" />
        <MetricCard label="Impressões" value={summary.impressions.toLocaleString()} icon={Target} color="bg-gray-50 text-gray-600" />
        <MetricCard label="Conversões" value={summary.conversions.toLocaleString()} icon={Target} color="bg-orange-50 text-orange-600" />
        <MetricCard label="CPA" value={fmtCurrency(summary.cpa)} sub="custo por conversão" icon={DollarSign} color="bg-yellow-50 text-yellow-600" />
        <MetricCard label="Campanhas ativas" value={String(campaignStats.find(s => s.status === 'ACTIVE')?.count ?? 0)} icon={Zap} color="bg-brand-50 text-brand-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-600" /> Ações do Optimizer</h2>
          {recentActions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma ação executada ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentActions.map(a => (
                <div key={a.id} className="flex items-start gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLOR[a.type] ?? 'bg-gray-100 text-gray-700'}`}>{a.type}</span>
                  <span className="text-gray-600 flex-1 truncate">{a.reason}</span>
                  <span className="text-gray-400 shrink-0">{a.executedAt ? new Date(a.executedAt).toLocaleDateString('pt-BR') : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4">Top Criativos Publicados</h2>
          {topCreatives.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum criativo publicado ainda.</p>
          ) : (
            <div className="space-y-2">
              {topCreatives.map(c => (
                <div key={c.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{c.angle}</p>
                    <p className="text-gray-400 text-xs">{c.hookType} · {c.format}</p>
                  </div>
                  {c.riskScore != null && (
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${c.riskScore > 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      risco {c.riskScore}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
