import { BusinessRuleViolation } from '../shared/DomainError';

export type CreativeFormat = 'COPY' | 'IMAGE' | 'VIDEO_SHORT' | 'CAROUSEL' | 'VSL';
export type CreativeFramework = 'AIDA' | 'PAS' | 'BAB' | 'FOUR_P' | 'FAB';
export type HookType =
  | 'COGNITIVE_DISSONANCE' | 'QUESTION' | 'BOLD' | 'CONTRARIAN'
  | 'BEFORE_AFTER' | 'FORBIDDEN' | 'PATTERN_INTERRUPT';
export type CreativeStatus =
  | 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';

export interface CreativeAssets {
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  copies: {
    primary: string;
    headline: string;
    cta: string;
    description?: string;
  };
}

export interface CreativeProps {
  id: string;
  orgId: string;
  productId: string;
  parentId?: string;
  version: string;
  format: CreativeFormat;
  framework: CreativeFramework;
  hookType: HookType;
  angle: string;
  assets: CreativeAssets;
  seed: string;
  metadata: Record<string, unknown>;
  riskScore?: number;
  status: CreativeStatus;
  createdAt: Date;
}

export class Creative {
  private constructor(private readonly props: CreativeProps) {}

  static create(props: Omit<CreativeProps, 'status' | 'createdAt'>): Creative {
    if (!props.orgId) throw new BusinessRuleViolation('Creative.orgId required');
    if (!props.productId) throw new BusinessRuleViolation('Creative.productId required');
    if (!props.angle.trim()) throw new BusinessRuleViolation('Creative.angle cannot be empty');
    return new Creative({ ...props, status: 'DRAFT', createdAt: new Date() });
  }

  static reconstitute(props: CreativeProps): Creative {
    return new Creative(props);
  }

  approve(): Creative {
    if (this.props.status !== 'PENDING_REVIEW')
      throw new BusinessRuleViolation('Creative must be PENDING_REVIEW to approve');
    return new Creative({ ...this.props, status: 'APPROVED' });
  }

  reject(): Creative {
    if (!['PENDING_REVIEW', 'DRAFT'].includes(this.props.status))
      throw new BusinessRuleViolation('Creative cannot be rejected in status: ' + this.props.status);
    return new Creative({ ...this.props, status: 'REJECTED' });
  }

  markPublished(): Creative {
    if (this.props.status !== 'APPROVED')
      throw new BusinessRuleViolation('Creative must be APPROVED to publish');
    return new Creative({ ...this.props, status: 'PUBLISHED' });
  }

  archive(): Creative {
    return new Creative({ ...this.props, status: 'ARCHIVED' });
  }

  withRiskScore(score: number): Creative {
    if (score < 0 || score > 100)
      throw new BusinessRuleViolation('RiskScore must be 0–100');
    return new Creative({ ...this.props, riskScore: score });
  }

  needsComplianceReview(): boolean {
    return this.props.riskScore === undefined || this.props.status === 'DRAFT';
  }

  isHighRisk(): boolean {
    return (this.props.riskScore ?? 0) > 70;
  }

  get id() { return this.props.id; }
  get orgId() { return this.props.orgId; }
  get productId() { return this.props.productId; }
  get parentId() { return this.props.parentId; }
  get version() { return this.props.version; }
  get format() { return this.props.format; }
  get framework() { return this.props.framework; }
  get hookType() { return this.props.hookType; }
  get angle() { return this.props.angle; }
  get assets() { return this.props.assets; }
  get seed() { return this.props.seed; }
  get metadata() { return this.props.metadata; }
  get riskScore() { return this.props.riskScore; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  toProps(): CreativeProps { return { ...this.props }; }
}
