---
name: project-infra-decisions
description: Decisões de infraestrutura do projeto NextFace — Postgres online, Vercel, sem Docker local
metadata:
  type: project
---

Postgres e Redis serão provisionados online (não Docker local).
Deploy do web app na Vercel.
Workers BullMQ rodarão em serviço separado (Railway/Fly.io).

**Why:** usuário não quer gerenciar infraestrutura local.
**How to apply:** nunca sugerir docker-compose para DB/Redis. Sempre referenciar Neon (Postgres + pgvector) e Upstash Redis.

**CRÍTICO — Projetos Vercel da conta:**
- `nextrends-web` → projeto NextFace (único que podemos modificar)
- `arenabeachserra` → projeto de outro cliente, NUNCA modificar
- Demais projetos da lista → não são nossos, não tocar
- Sempre usar `--project nextrends-web` em comandos CLI Vercel para nunca afetar outros projetos.
