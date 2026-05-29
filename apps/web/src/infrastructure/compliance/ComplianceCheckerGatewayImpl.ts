import type { ComplianceCheckerGateway, ComplianceResult } from '@nextface/application';
import type { AiGenerationGateway } from '@nextface/application';
import type { CreativeAssets } from '@nextface/domain';

const BLOCKED_TERMS = [
  'garantia de renda', 'lucro garantido', 'emagrecer garantido',
  'cure cancer', 'cura definitiva', 'faça rico rápido',
];

export class ComplianceCheckerGatewayImpl implements ComplianceCheckerGateway {
  constructor(private readonly ai: AiGenerationGateway) {}

  async check(assets: CreativeAssets, channel: string): Promise<ComplianceResult> {
    const fullCopy = `${assets.copies.primary} ${assets.copies.headline} ${assets.copies.cta}`;
    const copyLower = fullCopy.toLowerCase();

    const violations: string[] = [];
    const warnings: string[] = [];

    // fast-path: termos obviamente proibidos
    for (const term of BLOCKED_TERMS) {
      if (copyLower.includes(term.toLowerCase())) {
        violations.push(`Termo proibido detectado: "${term}"`);
      }
    }

    if (fullCopy.length > 2200) warnings.push('Copy acima de 2200 chars — pode ser truncada pelo canal');
    if (!assets.copies.cta) warnings.push('CTA ausente');

    // análise profunda via IA (detecta violações sutis que regex não pega)
    try {
      const aiResult = await this.ai.analyzeCompliance(fullCopy, channel);
      for (const v of aiResult.violations) {
        if (!violations.includes(v)) violations.push(v);
      }
      for (const w of aiResult.warnings) {
        if (!warnings.includes(w)) warnings.push(w);
      }
      const riskScore = Math.max(
        violations.length > 0 ? Math.min(100, 50 + violations.length * 20) : warnings.length * 10,
        aiResult.riskScore,
      );
      return { riskScore, approved: riskScore <= 70, violations, warnings, checkedAt: new Date() };
    } catch {
      const riskScore = violations.length > 0
        ? Math.min(100, 50 + violations.length * 20)
        : warnings.length * 10;
      return { riskScore, approved: riskScore <= 70, violations, warnings, checkedAt: new Date() };
    }
  }
}
