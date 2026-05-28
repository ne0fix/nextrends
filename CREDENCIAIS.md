# Guia de Geração de Credenciais — NextFace

**Como usar:** abra o `.env.template`, copie para `.env` e preencha conforme você vai obtendo cada credencial abaixo. Comece pelas seções marcadas como **OBRIGATÓRIO MVP** — sem elas o sistema não roda.

> Estimativa total: 3–6 horas para um operador novato; 1–2 horas para quem já tem Business Manager configurada.

---

## Ordem recomendada

1. Infraestrutura local (Postgres, Redis, segredos internos) — **OBRIGATÓRIO MVP**
2. Anthropic API Key (Claude) — **OBRIGATÓRIO MVP**
3. Meta App + Business Manager + Ads + Instagram + Pixel CAPI — **OBRIGATÓRIO MVP**
4. WhatsApp Business Cloud API (dentro da mesma App Meta) — **OBRIGATÓRIO MVP**
5. Google Cloud + YouTube Data API + OAuth — **OBRIGATÓRIO MVP**
6. Plataforma de venda (escolha 1: Kiwify ou Hotmart) — **OBRIGATÓRIO MVP**
7. TikTok for Business — recomendado v1.5
8. Telegram Bot — recomendado v1.5
9. HeyGen / ElevenLabs (vídeo + voz) — recomendado v1.5
10. Google Ads Developer Token — opcional v2.0

---

## 1) Infraestrutura local — OBRIGATÓRIO MVP

### 1.1 Postgres
Opções:
- **Local**: `docker run -d --name nextface-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16`
- **Cloud grátis**: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app).
- A connection string vai em `DATABASE_URL`.

### 1.2 Redis (filas)
- `docker run -d --name nextface-redis -p 6379:6379 redis:7`
- Ou Upstash (free tier).

### 1.3 Segredos internos
Gere com:
```bash
openssl rand -base64 48   # use para JWT_SECRET, SESSION_SECRET, WEBHOOK_SIGNING_SECRET
openssl rand -base64 32   # use para ENCRYPTION_KEY (AES-256)
```

### 1.4 Object storage
Opções: **Cloudflare R2** (mais barato), AWS S3, DigitalOcean Spaces. Crie um bucket chamado `nextface-assets`, gere Access Key + Secret e cole no `.env`.

---

## 2) Anthropic (Claude) — OBRIGATÓRIO MVP

1. Acesse https://console.anthropic.com/
2. Crie conta → adicione método de pagamento (compre crédito inicial, ex.: US$ 20).
3. **Settings → API Keys → Create Key**.
4. Cole em `ANTHROPIC_API_KEY`.

> Para fallback / DALL-E / TTS: opcionalmente crie chave em https://platform.openai.com/api-keys → `OPENAI_API_KEY`.

---

## 3) Meta — Facebook + Instagram + Ads + Pixel CAPI — OBRIGATÓRIO MVP

> **Importante:** tudo é gerado em UMA mesma App Meta. WhatsApp Cloud API (passo 4) também sai dela.

### 3.1 Pré-requisitos
- Conta pessoal Facebook ativa, com 2FA.
- **Business Manager** criada em https://business.facebook.com → "Criar conta".
- **Página do Facebook** ligada à BM.
- **Conta Instagram Business/Creator** vinculada à Página.
- **Conta de Anúncios** dentro da BM (Ads Account).

### 3.2 Criar a App Meta
1. https://developers.facebook.com/apps → **Create App**.
2. Tipo: **Business** → próximo.
3. Nome: `NextFace` → criar.
4. No painel da App, copie:
   - **App ID** → `META_APP_ID`
   - **App Secret** (Settings → Basic → Show) → `META_APP_SECRET`

### 3.3 Adicionar produtos à App
Na barra lateral "Add Product", adicione:
- **Marketing API** → para gerenciar campanhas/criativos.
- **Facebook Login for Business** → para OAuth.
- **WhatsApp** → para Cloud API (passo 4).
- **Webhooks** → para receber eventos.
- **Instagram Graph API** → para postagem.

### 3.4 Configurar Permissões / Escopos
Em **App Review → Permissions and Features**, solicite (em desenvolvimento todas funcionam para você/admins):
- `ads_management`, `ads_read`, `business_management`
- `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `pages_manage_engagement`
- `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`
- `read_insights`
- `whatsapp_business_management`, `whatsapp_business_messaging`

### 3.5 Gerar System User Token (longa duração — RECOMENDADO)
1. https://business.facebook.com → **Configurações de negócios → Usuários → Usuários do sistema → Adicionar**.
2. Nome: `nextface-bot`, papel: **Admin**.
3. **Atribuir ativos**: vincule sua Página, Conta de Ads, Pixel, conta IG (todas com acesso total).
4. Clique **Gerar token novo** → escolha sua App → escolha **Nunca expirar** → selecione todos os escopos da seção 3.4 → gerar.
5. Copie o token → `META_SYSTEM_USER_TOKEN`.
6. Copie o ID do System User → `META_SYSTEM_USER_ID`.
7. Copie o Business Manager ID (URL: `business.facebook.com/settings/?business_id=XXXX`) → `META_BUSINESS_ID`.

### 3.6 Obter IDs operacionais
Use o **Graph API Explorer** (https://developers.facebook.com/tools/explorer) com seu System User Token:

```
GET /me/businesses                    → confirma Business ID
GET /{business-id}/owned_ad_accounts  → META_AD_ACCOUNT_ID (formato act_XXXX)
GET /{business-id}/owned_pages        → META_PAGE_ID
GET /{page-id}?fields=instagram_business_account → META_IG_BUSINESS_ACCOUNT_ID
```

### 3.7 Pixel + CAPI
1. **Events Manager** → https://business.facebook.com/events_manager2 → "Conectar fonte de dados" → Web.
2. Crie um Pixel chamado `NextFace Pixel`. Copie o **Pixel ID** → `META_PIXEL_ID`.
3. Na aba **Settings** do Pixel → **Conversions API** → **Generate Access Token** → `META_PIXEL_CAPI_TOKEN`.
4. (Opcional) Use o **One-Click CAPI** (lançado abr/2026) para auto-config.

---

## 4) WhatsApp Business Cloud API — OBRIGATÓRIO MVP

> Use a **mesma App Meta** do passo 3.

1. No painel da App → produto **WhatsApp → API Setup**.
2. A Meta dá um número de teste grátis. Para produção, conecte seu próprio número (verificação por SMS + checagem da BM).
3. Copie:
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **WhatsApp Business Account ID** → `WHATSAPP_WABA_ID`
4. Crie um **Permanent Access Token** atribuindo o System User do passo 3.5 ao WABA:
   - Business Settings → WhatsApp Accounts → seu WABA → **Add People** → adicione o `nextface-bot` System User com controle total.
   - Volte ao System User → **Generate Token** com escopos `whatsapp_business_management` + `whatsapp_business_messaging`.
   - Cole em `WHATSAPP_PERMANENT_TOKEN`.
5. **Webhook**: defina uma URL pública (ngrok no dev) e um `WHATSAPP_VERIFY_TOKEN` (string que VOCÊ INVENTA).

---

## 5) Google Cloud + YouTube Data API + OAuth — OBRIGATÓRIO MVP

### 5.1 Criar projeto
1. https://console.cloud.google.com → **Criar projeto** → nome `nextface` → `GOOGLE_CLOUD_PROJECT_ID`.

### 5.2 Habilitar APIs
**APIs & Services → Library**, habilite:
- **YouTube Data API v3**
- **YouTube Analytics API**
- **YouTube Reporting API**
- **Google Ads API** (se for usar YouTube Ads / Search / Display)

### 5.3 OAuth Consent Screen
1. **APIs & Services → OAuth consent screen** → External → preencha nome do app, e-mail, logo.
2. Adicione **Test Users** (seu Gmail).
3. Adicione escopos:
   ```
   https://www.googleapis.com/auth/youtube.upload
   https://www.googleapis.com/auth/youtube
   https://www.googleapis.com/auth/youtube.force-ssl
   https://www.googleapis.com/auth/yt-analytics.readonly
   https://www.googleapis.com/auth/yt-analytics-monetary.readonly
   ```

### 5.4 OAuth Client ID
1. **Credentials → Create Credentials → OAuth client ID** → tipo **Web application**.
2. Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback` (dev) + produção.
3. Copie **Client ID** → `GOOGLE_OAUTH_CLIENT_ID` e **Client Secret** → `GOOGLE_OAUTH_CLIENT_SECRET`.

### 5.5 Refresh Token (gerado depois)
- Não preencha agora; o fluxo OAuth do app gera o Refresh Token na primeira conexão do usuário. O endpoint `/api/auth/google/callback` salva no banco.
- Se quiser gerar manualmente para testes: use [OAuth Playground](https://developers.google.com/oauthplayground) → engrenagem → "Use your own OAuth credentials" → cole Client ID + Secret → escolha escopos → autorize → Exchange code for tokens → copie Refresh Token.

### 5.6 API Key pública (leitura)
**Credentials → Create Credentials → API key** → restrinja a YouTube Data API → `YOUTUBE_API_KEY`.

### 5.7 (Opcional) Google Ads Developer Token
1. https://ads.google.com → Configurações → API Center → solicite Developer Token.
2. Aprovação em ~3 dias úteis (em sandbox antes).
3. Cole em `GOOGLE_ADS_DEVELOPER_TOKEN` + Customer ID (Painel Google Ads, topo direito, formato 123-456-7890) em `GOOGLE_ADS_CUSTOMER_ID`.

---

## 6) Plataforma de venda (escolha 1) — OBRIGATÓRIO MVP

### Kiwify (recomendado para começar)
1. Login em https://dashboard.kiwify.com.br
2. **Apps & Integrações → Criar App** (se ainda não tiver na UI, vá em "Webhooks" + "API Key").
3. Gere **Client ID + Client Secret** → `KIWIFY_CLIENT_ID` / `KIWIFY_CLIENT_SECRET`.
4. Configure webhook com a URL do seu BFF e um secret → `KIWIFY_WEBHOOK_SECRET`.

### Hotmart (alternativa)
1. https://developers.hotmart.com → **Meus apps → Criar**.
2. Copie **Client ID**, **Client Secret**, **Basic Token** → variáveis correspondentes.
3. Em **Ferramentas → Webhook**, defina o Hottok → `HOTMART_HOTTOK`.

> Demais (Eduzz, Monetizze, HeroSpark, Ticto): cada uma tem painel "Integrações" próprio com geração de API Key. Adicione conforme for usar.

---

## 7) TikTok for Business — recomendado v1.5

1. https://business-api.tiktok.com/portal → **Become a Developer** → criar app.
2. **App Info → Marketing API + Content Posting API** → habilitar.
3. Em **App Details**, copie **App ID** → `TIKTOK_APP_ID` e **App Secret** → `TIKTOK_APP_SECRET`.
4. **Auth URL**: configure redirect `http://localhost:3000/api/auth/tiktok/callback`.
5. Autorize sua conta de Business Center → obtém **Access Token** → `TIKTOK_ACCESS_TOKEN`.
6. No Business Center, copie **Advertiser ID** → `TIKTOK_ADVERTISER_ID` e **BC ID** → `TIKTOK_BC_ID`.
7. **TikTok Events Manager** → crie Pixel → `TIKTOK_PIXEL_ID` + Events API token → `TIKTOK_EVENTS_TOKEN`.

---

## 8) Telegram Bot — recomendado v1.5

1. No app Telegram, abra @BotFather → `/newbot` → siga as instruções.
2. Copie o **Token** → `TELEGRAM_BOT_TOKEN`.
3. Crie um canal (público ou privado), adicione o bot como **admin**.
4. Para descobrir o `TELEGRAM_CHANNEL_ID`:
   - Para canal público: use `@usuarioCanal`.
   - Para privado: encaminhe uma mensagem do canal para @userinfobot → ele retorna ID no formato `-100XXXXXXXXXX`.

---

## 9) IA generativa de vídeo e voz — recomendado v1.5

### ElevenLabs (voz)
1. https://elevenlabs.io → Sign up → plano com clonagem (Starter ou superior).
2. **Settings → API Keys → Create** → `ELEVENLABS_API_KEY`.
3. Para voice cloning: faça upload de 1–3min de áudio limpo da voz.

### HeyGen (avatares + B-roll Veo/Sora)
1. https://app.heygen.com → assine plano que inclui API.
2. **Settings → API Access** → gere chave → `HEYGEN_API_KEY`.

### Synthesia (opcional)
1. https://www.synthesia.io → plano Enterprise inclui API.
2. **Integrations → API** → gere chave → `SYNTHESIA_API_KEY`.

---

## 10) Boas práticas de segurança das chaves

- **NUNCA** commite o `.env`. Confirme que está no `.gitignore` (já incluso na maioria dos templates Next).
- Em produção use **gestor de segredos** (Doppler, Infisical, Vault, AWS Secrets Manager).
- Habilite **2FA obrigatório** em: Meta, Google, TikTok, Anthropic, Kiwify/Hotmart.
- Rotacione tokens a cada 90 dias para os de longa duração.
- Em caso de vazamento suspeito: revogue imediatamente no painel original e gere novo.
- Mantenha um **backup criptografado** das chaves (1Password, Bitwarden) — perder o Refresh Token Google obriga novo OAuth.

---

## Checklist final do MVP

Marque conforme for obtendo:

- [ ] `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `META_APP_ID`, `META_APP_SECRET`, `META_SYSTEM_USER_TOKEN`
- [ ] `META_BUSINESS_ID`, `META_AD_ACCOUNT_ID`, `META_PAGE_ID`, `META_IG_BUSINESS_ACCOUNT_ID`
- [ ] `META_PIXEL_ID`, `META_PIXEL_CAPI_TOKEN`
- [ ] `WHATSAPP_WABA_ID`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_PERMANENT_TOKEN`
- [ ] `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `YOUTUBE_API_KEY`
- [ ] `KIWIFY_CLIENT_ID` + `KIWIFY_CLIENT_SECRET` (ou Hotmart equivalente)
- [ ] `S3_*` (storage)

Com a checklist acima completa você roda o MVP. As demais credenciais (TikTok, Telegram, HeyGen, Google Ads) podem ser adicionadas nas iterações seguintes sem refator.
