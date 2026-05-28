# NextFace — Setup e Deploy

## Pré-requisitos
- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Conta Neon (Postgres) — https://neon.tech
- Conta Upstash (Redis) — https://upstash.com
- Conta Vercel — https://vercel.com

---

## 1. Banco de dados — Neon

1. https://neon.tech → **New Project** → nome `nextface`
2. Habilite a extensão **pgvector**: SQL Editor → `CREATE EXTENSION IF NOT EXISTS vector;`
3. Em **Connection Details**, copie:
   - **Pooled connection string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_URL`

---

## 2. Redis — Upstash

1. https://upstash.com → **Create Database** → nome `nextface`
2. Copie a **Redis URL** (`rediss://...`) → `REDIS_URL`

---

## 3. Variáveis de ambiente

Copie `.env.template` para `.env` e preencha:

```bash
cp .env.template .env
# edite .env com as credenciais coletadas
```

Gere segredos fortes:
```bash
openssl rand -base64 32   # use para NEXTAUTH_SECRET, ENCRYPTION_KEY, JWT_SECRET
```

---

## 4. Instalar dependências e gerar Prisma client

```bash
pnpm install
pnpm db:generate
```

---

## 5. Rodar migrations (primeira vez)

```bash
pnpm db:deploy
# ou em desenvolvimento:
pnpm db:migrate
```

---

## 6. Rodar em desenvolvimento

```bash
pnpm dev
# abre http://localhost:3000
```

---

## 7. Deploy na Vercel

### Via CLI
```bash
npm i -g vercel
vercel --cwd apps/web
```

### Via GitHub (recomendado)
1. Faça push do repositório para o GitHub
2. https://vercel.com → **Add New Project** → importe o repositório
3. **Root Directory**: `apps/web`
4. Em **Environment Variables**, adicione TODAS as variáveis do `.env`
5. Clique em **Deploy**

### Variáveis obrigatórias na Vercel
```
DATABASE_URL
DIRECT_URL
REDIS_URL
NEXTAUTH_SECRET
NEXTAUTH_URL         # ex.: https://seuapp.vercel.app
ENCRYPTION_KEY
META_APP_ID
META_APP_SECRET
META_API_VERSION
META_OAUTH_REDIRECT_URI   # https://seuapp.vercel.app/api/v1/integrations/meta/callback
ANTHROPIC_API_KEY
NEXT_PUBLIC_META_APP_ID
NEXT_PUBLIC_APP_URL
```

---

## 8. Workers (BullMQ) — Railway

Os workers precisam de um processo Node.js persistente (Vercel é serverless).

1. https://railway.app → **New Project → Deploy from GitHub**
2. Root directory: `apps/worker`
3. Start command: `pnpm start`
4. Adicione as mesmas variáveis de ambiente (principalmente `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`)

---

## Arquitetura do projeto

```
nextface/
├── apps/
│   ├── web/          # Next.js 16 (Vercel)
│   └── worker/       # BullMQ workers (Railway/Fly.io)
├── packages/
│   ├── domain/       # Entidades e regras de negócio puras
│   ├── application/  # Use Cases e Ports
│   ├── schemas/      # Zod schemas compartilhados
│   ├── ui/           # Design System
│   └── config/       # TS, ESLint, Tailwind configs
└── prisma/           # Schema e migrations
```

## Comandos úteis

```bash
pnpm dev              # Sobe web + worker em watch mode
pnpm build            # Build de todos os packages
pnpm typecheck        # Type check em todos
pnpm db:migrate       # Nova migration (dev)
pnpm db:deploy        # Aplica migrations (produção)
pnpm db:seed          # Seed inicial
```
