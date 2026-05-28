import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional().default('postgresql://placeholder'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  NEXTAUTH_SECRET: z.string().min(1).optional().default('dev-secret'),
  NEXTAUTH_URL: z.string().url().optional().default('http://localhost:3000'),

  META_APP_ID: z.string().optional().default(''),
  META_APP_SECRET: z.string().optional().default(''),
  META_API_VERSION: z.string().default('v22.0'),
  META_OAUTH_REDIRECT_URI: z.string().optional().default('http://localhost:3000/api/v1/integrations/meta/callback'),

  WHATSAPP_VERIFY_TOKEN: z.string().optional(),

  YOUTUBE_API_KEY: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),

  TIKTOK_APP_ID: z.string().optional(),
  TIKTOK_APP_SECRET: z.string().optional(),

  ANTHROPIC_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  HEYGEN_API_KEY: z.string().optional(),

  ENCRYPTION_KEY: z.string().optional().default('dev-enc-key-32-chars-placeholder!!'),
  JWT_SECRET: z.string().optional().default('dev-jwt-secret-32-chars-placeholder'),

  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().default('nextface-assets'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  AUTONOMY_MODE_DEFAULT: z.enum(['OBSERVER', 'COPILOT', 'AUTONOMOUS', 'SOVEREIGN']).default('COPILOT'),
  DAILY_BUDGET_HARD_CAP: z.coerce.number().default(500),
  ENABLE_REAL_PUBLISHING: z.coerce.boolean().default(false),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
