/**
 * Servidor HTTP interno do worker para chamadas de IA via Claude Code CLI.
 * Recebe requisições do web BFF (Vercel) e executa via `claude -p` subprocess,
 * usando a autenticação OAuth do Claude Code (sem cobrar créditos de API).
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import type { Logger } from 'pino';
import { ClaudeCodeSubprocessGateway } from './ai/ClaudeCodeSubprocessGateway.js';

const SYSTEM_CREATIVE = `Você é um especialista em marketing digital e copywriting para infoprodutos brasileiros.
Gere criativos persuasivos usando frameworks de alta conversão.
Sempre responda em JSON válido sem markdown.`;

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

export function startAiServer(port: number, logger: Logger) {
  const gateway = new ClaudeCodeSubprocessGateway();

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '';

    if (req.method === 'GET' && url === '/health') {
      send(res, 200, { ok: true, service: 'nextface-ai-server' });
      return;
    }

    if (req.method !== 'POST') {
      send(res, 405, { error: 'Method Not Allowed' });
      return;
    }

    try {
      const body = await readBody(req) as Record<string, unknown>;

      // POST /ai/generate — generateCreativeAssets
      if (url === '/ai/generate') {
        const { productDossier, format, framework, hookType, angle, channel, seed } =
          body as { productDossier: unknown; format: string; framework: string; hookType: string; angle: string; channel: string; seed?: string };

        const prompt = `Gere um criativo completo com:
- Framework: ${framework}
- Hook type: ${hookType}
- Ângulo: ${angle}
- Canal: ${channel}
- Formato: ${format}

Produto/Dossier: ${JSON.stringify(productDossier)}

Responda SOMENTE com JSON no formato:
{
  "primary": "texto principal (máx 2200 chars)",
  "headline": "título chamativo (máx 100 chars)",
  "cta": "chamada para ação",
  "description": "descrição complementar"
}`;

        const result = await gateway.run(prompt, SYSTEM_CREATIVE);
        let copies: { primary: string; headline: string; cta: string; description?: string };
        try { copies = JSON.parse(result.text) as typeof copies; }
        catch { copies = { primary: result.text, headline: 'Oferta especial', cta: 'Saiba mais' }; }

        const usedSeed = (seed as string | undefined) ?? crypto.randomUUID();
        logger.info({ costUsd: result.costUsd, hook: hookType }, 'ai/generate completed');
        send(res, 200, { assets: { copies }, seed: usedSeed, model: 'claude-code-cli', tokensUsed: 0, costUsd: result.costUsd });
        return;
      }

      // POST /ai/dossier — generateProductDossier
      if (url === '/ai/dossier') {
        const { rawData } = body as { rawData: unknown };
        const prompt = `Analise este produto digital e gere um dossier de marketing completo em JSON:
${JSON.stringify(rawData)}

Responda com:
{
  "targetAudience": "...",
  "pains": ["..."],
  "benefits": ["..."],
  "objections": ["..."],
  "triggers": ["..."],
  "proofPoints": ["..."]
}`;

        const result = await gateway.run(prompt);
        let dossier: Record<string, unknown>;
        try { dossier = JSON.parse(result.text) as Record<string, unknown>; }
        catch { dossier = { raw: result.text }; }

        logger.info({ costUsd: result.costUsd }, 'ai/dossier completed');
        send(res, 200, { dossier, tokensUsed: 0, costUsd: result.costUsd });
        return;
      }

      // POST /ai/hotscore — computeHotScore
      if (url === '/ai/hotscore') {
        const { productData } = body as { productData: unknown };
        const prompt = `Analise este produto e retorne um Hot Score de 0-100 com explicação em JSON:
${JSON.stringify(productData)}
Formato: { "score": 75, "explanation": "..." }`;

        const result = await gateway.run(prompt);
        let parsed: { score: number; explanation: string };
        try { parsed = JSON.parse(result.text) as typeof parsed; }
        catch { parsed = { score: 50, explanation: result.text }; }

        logger.info({ score: parsed.score, costUsd: result.costUsd }, 'ai/hotscore completed');
        send(res, 200, { ...parsed, costUsd: result.costUsd });
        return;
      }

      // POST /ai/classify — classifyCreative
      if (url === '/ai/classify') {
        const { metrics } = body as { metrics: unknown };
        const prompt = `Classifique este criativo baseado nas métricas abaixo.
Métricas: ${JSON.stringify(metrics)}
Classes possíveis: WINNER, PROMISING, STABLE, FATIGUED, LOSER
Responda: { "classification": "...", "confidence": 0.9, "explanation": "...", "suggestedAction": "..." }`;

        const result = await gateway.run(prompt);
        let parsed: { classification: string; confidence: number; explanation: string; suggestedAction?: string };
        try { parsed = JSON.parse(result.text) as typeof parsed; }
        catch { parsed = { classification: 'STABLE', confidence: 0.5, explanation: result.text }; }

        logger.info({ classification: parsed.classification, costUsd: result.costUsd }, 'ai/classify completed');
        send(res, 200, { ...parsed, costUsd: result.costUsd });
        return;
      }

      send(res, 404, { error: 'Not Found' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ err: message, url }, 'ai-server error');
      send(res, 500, { error: message });
    }
  });

  server.listen(port, () => {
    logger.info({ port }, 'NextFace AI Server (Claude Code CLI) listening');
  });

  return server;
}
