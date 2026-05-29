import type { CreativeFormat, CreativeFramework, HookType, CreativeAssets } from '@nextface/domain';

export interface GenerateCreativeParams {
  productDossier: Record<string, unknown>;
  format: CreativeFormat;
  framework: CreativeFramework;
  hookType: HookType;
  angle: string;
  channel: string;
  seed?: string;
  existingAssets?: Partial<CreativeAssets>;
}

export interface AiGenerationGateway {
  generateCreativeAssets(params: GenerateCreativeParams): Promise<{
    assets: CreativeAssets;
    seed: string;
    model: string;
    tokensUsed: number;
  }>;

  generateProductDossier(rawData: Record<string, unknown>): Promise<{
    dossier: Record<string, unknown>;
    tokensUsed: number;
  }>;

  computeHotScore(productData: Record<string, unknown>): Promise<{
    score: number;
    explanation: string;
  }>;

  classifyCreative(metrics: Record<string, unknown>): Promise<{
    classification: string;
    confidence: number;
    explanation: string;
    suggestedAction?: string;
  }>;

  analyzeCompliance(copy: string, channel: string): Promise<{
    violations: string[];
    warnings: string[];
    riskScore: number;
  }>;
}
