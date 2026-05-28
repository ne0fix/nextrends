'use client';

import { env } from '@/lib/env';
import { CheckCircle2, AlertCircle, XCircle, ExternalLink } from 'lucide-react';

type Integration = {
  id: string;
  provider: string;
  status: string;
  externalAccountIds: string[];
  lastHealthOk: boolean;
  lastHealthCheckAt: Date | null;
  expiresAt: Date | null;
};

const PROVIDER_META: Record<string, { name: string; color: string; connectUrl?: string }> = {
  META: {
    name: 'Meta (Facebook + Instagram)',
    color: 'bg-blue-50 border-blue-200',
    connectUrl: undefined,
  },
  WHATSAPP: { name: 'WhatsApp Business', color: 'bg-green-50 border-green-200' },
  YOUTUBE: { name: 'YouTube', color: 'bg-red-50 border-red-200' },
  TIKTOK: { name: 'TikTok for Business', color: 'bg-pink-50 border-pink-200' },
  TELEGRAM: { name: 'Telegram', color: 'bg-sky-50 border-sky-200' },
  KIWIFY: { name: 'Kiwify', color: 'bg-violet-50 border-violet-200' },
  HOTMART: { name: 'Hotmart', color: 'bg-orange-50 border-orange-200' },
};

function StatusBadge({ status, ok }: { status: string; ok: boolean }) {
  if (status === 'CONNECTED' && ok)
    return <span className="flex items-center gap-1 text-green-700 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Conectado</span>;
  if (status === 'DEGRADED')
    return <span className="flex items-center gap-1 text-yellow-700 text-xs font-medium"><AlertCircle className="w-3.5 h-3.5" /> Degradado</span>;
  if (status === 'EXPIRED')
    return <span className="flex items-center gap-1 text-orange-700 text-xs font-medium"><AlertCircle className="w-3.5 h-3.5" /> Expirado</span>;
  return <span className="flex items-center gap-1 text-red-700 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Revogado</span>;
}

function metaOAuthUrl(): string {
  // Fase 1 (dev/teste): escopos básicos que funcionam sem App Review
  // Fase 2 (produção): adicionar ads_management, instagram_content_publish etc. após App Review
  const scopesBasic = [
    'public_profile',
    'business_management',
    'pages_show_list',
    'pages_read_engagement',
  ];

  // Escopos avançados — só incluir se o app tiver App Review aprovado
  const scopesAdvanced = [
    'email',
    'pages_manage_metadata',
    'ads_management',
    'ads_read',
    'pages_manage_posts',
    'pages_manage_engagement',
    'instagram_business_basic',
    'instagram_content_publish',
    'instagram_manage_comments',
    'instagram_manage_insights',
    'read_insights',
    'whatsapp_business_management',
    'whatsapp_business_messaging',
  ];

  const appReviewApproved = process.env.NEXT_PUBLIC_META_APP_REVIEW === 'true';
  const scopes = appReviewApproved
    ? [...scopesBasic, ...scopesAdvanced]
    : scopesBasic;

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_META_APP_ID ?? '',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/v1/integrations/meta/callback`,
    scope: scopes.join(','),
    response_type: 'code',
  });
  return `https://www.facebook.com/v22.0/dialog/oauth?${params}`;
}

export function IntegrationsView({ integrations }: { integrations: Integration[] }) {
  const connected = integrations.reduce<Record<string, Integration>>((acc, i) => {
    acc[i.provider] = i;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Integrações</h1>
      <p className="text-gray-500 text-sm mb-4">Conecte suas plataformas para ativar a automação.</p>

      {process.env.NEXT_PUBLIC_META_APP_REVIEW !== 'true' && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <p className="font-semibold text-amber-800 mb-1">⚠️ App Meta em modo desenvolvimento</p>
          <p className="text-amber-700 text-xs">
            A conexão Meta funciona apenas para usuários Admin/Tester do app enquanto o App Review não for aprovado.
            Para liberar para todos, submeta o app para revisão em{' '}
            <a href="https://developers.facebook.com/apps/1024344033282892/app-review/" target="_blank" rel="noreferrer"
              className="underline font-medium">Meta App Review</a>
            {' '}e adicione <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_META_APP_REVIEW=true</code> nas env vars da Vercel.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {Object.entries(PROVIDER_META).map(([key, meta]) => {
          const integration = connected[key];

          return (
            <div key={key} className={`rounded-xl border p-5 flex items-center justify-between ${meta.color}`}>
              <div>
                <p className="font-semibold">{meta.name}</p>
                {integration ? (
                  <div className="mt-1 space-y-0.5">
                    <StatusBadge status={integration.status} ok={integration.lastHealthOk} />
                    <p className="text-xs text-gray-500">{integration.externalAccountIds.length} recursos detectados</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Não conectado</p>
                )}
              </div>

              {!integration && key === 'META' && (
                <a
                  href={metaOAuthUrl()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Conectar
                </a>
              )}

              {!integration && key !== 'META' && (
                <span className="text-xs text-gray-400">Em breve</span>
              )}

              {integration && (
                <button className="text-xs text-gray-500 hover:text-red-600 transition-colors">
                  Revogar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
