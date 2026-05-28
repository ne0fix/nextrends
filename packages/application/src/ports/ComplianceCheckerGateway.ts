import type { CreativeAssets } from '@nextface/domain';

export interface ComplianceResult {
  riskScore: number;          // 0–100
  approved: boolean;          // false se score > 70
  violations: string[];
  warnings: string[];
  checkedAt: Date;
}

export interface ComplianceCheckerGateway {
  check(assets: CreativeAssets, channel: string): Promise<ComplianceResult>;
}
