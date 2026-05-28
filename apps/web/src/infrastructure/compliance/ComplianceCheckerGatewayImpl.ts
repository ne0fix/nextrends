import type { ComplianceCheckerGateway, ComplianceResult } from '@nextface/application';
import type { AiGenerationGateway } from '@nextface/application';
import type { CreativeAssets } from '@nextface/domain';

const BLOCKED_TERMS = [
  'garantia de renda', 'lucro garantido', 'emagrecer garantido',
  'cure cancer', 'cura definitiva', 'faça rico rápido',
];

export class ComplianceCheckerGatewayImpl implements ComplianceCheckerGateway {
  constructor(private readonly ai: AiGenerationGateway) {}

  async check(assets: CreativeAssets, _channel: string): Promise<ComplianceResult> {
    const copy = `${assets.copies.primary} ${assets.copies.headline} ${assets.copies.cta}`.toLowerCase();

    const violations: string[] = [];
    const warnings: string[] = [];

    for (const term of BLOCKED_TERMS) {
      if (copy.includes(term.toLowerCase())) {
        violations.push(`Termo proibido detectado: "${term}"`);
      }
    }

    if (copy.length > 2200) warnings.push('Copy acima de 2200 chars — pode ser truncada pelo canal');
    if (!assets.copies.cta) warnings.push('CTA ausente');

    const riskScore = violations.length > 0
      ? Math.min(100, 50 + violations.length * 20)
      : warnings.length * 10;

    return {
      riskScore,
      approved: riskScore <= 70,
      violations,
      warnings,
      checkedAt: new Date(),
    };
  }
}
