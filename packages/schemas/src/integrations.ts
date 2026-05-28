import { z } from 'zod';

export const ProviderSchema = z.enum([
  'META', 'TIKTOK', 'GOOGLE', 'YOUTUBE', 'WHATSAPP', 'TELEGRAM',
  'KIWIFY', 'HOTMART', 'EDUZZ', 'MONETIZZE', 'HEROSPARK', 'TICTO',
]);
export type Provider = z.infer<typeof ProviderSchema>;

export const IntegrationStatusSchema = z.enum(['CONNECTED', 'DEGRADED', 'EXPIRED', 'REVOKED']);
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

export const ConnectMetaIntegrationSchema = z.object({
  orgId: z.string(),
  code: z.string(),              // OAuth code
  redirectUri: z.string().url(),
});

export const ConnectManualIntegrationSchema = z.object({
  orgId: z.string(),
  provider: ProviderSchema,
  credentials: z.record(z.string()),  // chave→valor; encriptado antes de salvar
  externalAccountIds: z.array(z.string()).default([]),
  scopes: z.array(z.string()).default([]),
});

export const RevokeIntegrationSchema = z.object({
  orgId: z.string(),
  integrationId: z.string(),
});

export const HealthCheckResultSchema = z.object({
  integrationId: z.string(),
  ok: z.boolean(),
  checkedAt: z.date(),
  error: z.string().optional(),
  detectedResources: z.object({
    pages: z.array(z.string()).optional(),
    adAccounts: z.array(z.string()).optional(),
    instagramAccounts: z.array(z.string()).optional(),
    channels: z.array(z.string()).optional(),
  }).optional(),
});
