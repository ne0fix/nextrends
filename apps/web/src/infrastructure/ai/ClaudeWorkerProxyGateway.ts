import type { AiGenerationGateway, GenerateCreativeParams } from '@nextface/application';

/**
 * Gateway que delega chamadas de IA ao worker (Railway) via HTTP interno.
 * O worker usa `claude -p` subprocess com autenticação OAuth (Pro/Max),
 * eliminando o consumo de créditos da Anthropic API.
 * Ativado quando WORKER_AI_URL está definido no ambiente.
 */
export class ClaudeWorkerProxyGateway implements AiGenerationGateway {
  constructor(private readonly baseUrl: string) {}

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(130_000),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Worker AI ${path} falhou (${res.status}): ${text.slice(0, 300)}`);
    }
    return res.json() as Promise<T>;
  }

  async generateCreativeAssets(params: GenerateCreativeParams) {
    return this.post<{
      assets: { copies: { primary: string; headline: string; cta: string; description?: string } };
      seed: string;
      model: string;
      tokensUsed: number;
    }>('/ai/generate', params);
  }

  async generateProductDossier(rawData: Record<string, unknown>) {
    return this.post<{ dossier: Record<string, unknown>; tokensUsed: number }>('/ai/dossier', { rawData });
  }

  async computeHotScore(productData: Record<string, unknown>) {
    return this.post<{ score: number; explanation: string }>('/ai/hotscore', { productData });
  }

  async classifyCreative(metrics: Record<string, unknown>) {
    return this.post<{ classification: string; confidence: number; explanation: string; suggestedAction?: string }>(
      '/ai/classify',
      { metrics },
    );
  }

  async analyzeCompliance(copy: string, channel: string) {
    return this.post<{ violations: string[]; warnings: string[]; riskScore: number }>(
      '/ai/compliance',
      { copy, channel },
    );
  }
}
