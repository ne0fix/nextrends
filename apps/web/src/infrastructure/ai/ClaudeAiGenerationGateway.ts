import Anthropic from '@anthropic-ai/sdk';
import type { AiGenerationGateway, GenerateCreativeParams } from '@nextface/application';
import { env } from '../../lib/env';

export class ClaudeAiGenerationGateway implements AiGenerationGateway {
  private readonly client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  private readonly model = 'claude-sonnet-4-6';

  async generateCreativeAssets(params: GenerateCreativeParams) {
    const seed = params.seed ?? crypto.randomUUID();

    const systemPrompt = `Você é um especialista em marketing digital e copywriting para infoprodutos brasileiros.
Gere criativos persuasivos usando frameworks de alta conversão.
Sempre responda em JSON válido sem markdown.`;

    const userPrompt = `Gere um criativo completo com:
- Framework: ${params.framework}
- Hook type: ${params.hookType}
- Ângulo: ${params.angle}
- Canal: ${params.channel}
- Formato: ${params.format}

Produto/Dossier: ${JSON.stringify(params.productDossier)}

Responda SOMENTE com JSON no formato:
{
  "primary": "texto principal (máx 2200 chars)",
  "headline": "título chamativo (máx 100 chars)",
  "cta": "chamada para ação",
  "description": "descrição complementar"
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    let copies: { primary: string; headline: string; cta: string; description?: string };
    try {
      copies = JSON.parse(text) as typeof copies;
    } catch {
      copies = { primary: text, headline: 'Oferta especial', cta: 'Saiba mais' };
    }

    return {
      assets: { copies },
      seed,
      model: this.model,
      tokensUsed: (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
    };
  }

  async generateProductDossier(rawData: Record<string, unknown>) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Analise este produto digital e gere um dossier de marketing completo em JSON:
${JSON.stringify(rawData)}

Responda com:
{
  "targetAudience": "...",
  "pains": ["..."],
  "benefits": ["..."],
  "objections": ["..."],
  "triggers": ["..."],
  "proofPoints": ["..."]
}`,
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    return {
      dossier: JSON.parse(text) as Record<string, unknown>,
      tokensUsed: (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
    };
  }

  async computeHotScore(productData: Record<string, unknown>) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Analise este produto e retorne um Hot Score de 0-100 com explicação em JSON:
${JSON.stringify(productData)}
Formato: { "score": 75, "explanation": "..." }`,
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{"score":50,"explanation":""}';
    const result = JSON.parse(text) as { score: number; explanation: string };
    return { score: result.score, explanation: result.explanation };
  }

  async classifyCreative(metrics: Record<string, unknown>) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Classifique este criativo baseado nas métricas abaixo.
Métricas: ${JSON.stringify(metrics)}
Classes possíveis: WINNER, PROMISING, STABLE, FATIGUED, LOSER
Responda: { "classification": "...", "confidence": 0.9, "explanation": "...", "suggestedAction": "..." }`,
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(text) as {
      classification: string;
      confidence: number;
      explanation: string;
      suggestedAction?: string;
    };
  }

  async analyzeCompliance(copy: string, channel: string) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Você é um especialista em compliance de publicidade digital brasileiro (CONAR, BACEN, ANVISA).
Analise este criativo para o canal ${channel} e identifique violações de conformidade.

Criativo:
${copy}

Responda SOMENTE com JSON:
{ "violations": ["violação grave 1"], "warnings": ["aviso menor 1"], "riskScore": 0 }`,
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{"violations":[],"warnings":[],"riskScore":0}';
    try {
      return JSON.parse(text) as { violations: string[]; warnings: string[]; riskScore: number };
    } catch {
      return { violations: [], warnings: [], riskScore: 0 };
    }
  }
}
