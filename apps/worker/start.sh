#!/bin/sh
# Restaura credenciais do Claude Code a partir de CLAUDE_CONFIG_B64
# e inicia o worker

if [ -n "$CLAUDE_CONFIG_B64" ] && [ "$CLAUDE_CONFIG_B64" != "PENDENTE_PREENCHER" ]; then
  echo "[start] Restaurando Claude config..."
  mkdir -p "$HOME/.claude"
  echo "$CLAUDE_CONFIG_B64" | base64 -d | tar -xzf - -C "$HOME" 2>/dev/null
  echo "[start] Claude config restaurado."
else
  echo "[start] CLAUDE_CONFIG_B64 não definido — usando ANTHROPIC_API_KEY se disponível."
fi

exec node dist/index.js
