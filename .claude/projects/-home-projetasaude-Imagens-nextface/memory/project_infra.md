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
