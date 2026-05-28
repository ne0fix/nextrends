import { z } from 'zod';

// Preprocess helper: trata string vazia ou comentário como undefined
const optStr = z.preprocess(
  (v) => (!v || String(v).trim().startsWith('#') || String(v).trim() === '' ? undefined : v),
  z.string().optional()
);

const envSchema = z.object({
  DATABASE_URL:        optStr.default('postgresql://localhost/nextface'),
  DIRECT_URL:          optStr.default('postgresql://localhost/nextface'),
  REDIS_URL:           optStr.default('redis://localhost:6379'),
  NEXTAUTH_SECRET:     optStr.default('dev-secret-change-in-production'),
  NEXTAUTH_URL:        optStr.default('http://localhost:3000'),
  META_APP_ID:         optStr.default(''),
  META_APP_SECRET:     optStr.default(''),
  META_API_VERSION:    z.string().default('v22.0'),
  META_OAUTH_REDIRECT_URI: optStr.default('http://localhost:3000/api/v1/integrations/meta/callback'),
  WHATSAPP_VERIFY_TOKEN:   optStr,
  YOUTUBE_API_KEY:         optStr,
  GOOGLE_OAUTH_CLIENT_ID:  optStr,
  GOOGLE_OAUTH_CLIENT_SECRET: optStr,
  TIKTOK_APP_ID:       optStr,
  TIKTOK_APP_SECRET:   optStr,
  ANTHROPIC_API_KEY:   optStr.default(''),
  OPENAI_API_KEY:      optStr,
  ELEVENLABS_API_KEY:  optStr,
  HEYGEN_API_KEY:      optStr,
  ENCRYPTION_KEY:      optStr.default('dev-encryption-key-change-this!!'),
  JWT_SECRET:          optStr.default('dev-jwt-secret-change-this!!!!!!'),
  S3_ENDPOINT:         optStr,
  S3_REGION:           z.string().default('auto'),
  S3_BUCKET:           z.string().default('nextface-assets'),
  S3_ACCESS_KEY:       optStr,
  S3_SECRET_KEY:       optStr,
  AUTONOMY_MODE_DEFAULT: z.enum(['OBSERVER','COPILOT','AUTONOMOUS','SOVEREIGN']).default('COPILOT'),
  DAILY_BUDGET_HARD_CAP: z.coerce.number().default(500),
  ENABLE_REAL_PUBLISHING: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  RESEND_API_KEY: optStr,
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export const env: Env = new Proxy({} as Env, {
  get(_target, prop) {
    if (!_env) {
      _env = envSchema.parse(process.env);
    }
    return (_env as Record<string, unknown>)[prop as string];
  },
});
