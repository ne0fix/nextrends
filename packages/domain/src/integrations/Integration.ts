import { BusinessRuleViolation } from '../shared/DomainError';

export type Provider =
  | 'META' | 'TIKTOK' | 'GOOGLE' | 'YOUTUBE' | 'WHATSAPP' | 'TELEGRAM'
  | 'KIWIFY' | 'HOTMART' | 'EDUZZ' | 'MONETIZZE' | 'HEROSPARK' | 'TICTO';

export type IntegrationStatus = 'CONNECTED' | 'DEGRADED' | 'EXPIRED' | 'REVOKED';

export interface IntegrationProps {
  id: string;
  orgId: string;
  provider: Provider;
  status: IntegrationStatus;
  externalAccountIds: string[];
  scopes: string[];
  expiresAt?: Date;
  lastHealthCheckAt?: Date;
  lastHealthOk: boolean;
  createdAt: Date;
}

export class Integration {
  private constructor(private readonly props: IntegrationProps) {}

  static create(props: Omit<IntegrationProps, 'status' | 'lastHealthOk' | 'createdAt'>): Integration {
    if (!props.orgId) throw new BusinessRuleViolation('Integration.orgId required');
    return new Integration({ ...props, status: 'CONNECTED', lastHealthOk: true, createdAt: new Date() });
  }

  static reconstitute(props: IntegrationProps): Integration {
    return new Integration(props);
  }

  markHealthy(detectedAt: Date): Integration {
    return new Integration({ ...this.props, lastHealthCheckAt: detectedAt, lastHealthOk: true, status: 'CONNECTED' });
  }

  markDegraded(checkedAt: Date): Integration {
    return new Integration({ ...this.props, lastHealthCheckAt: checkedAt, lastHealthOk: false, status: 'DEGRADED' });
  }

  markExpired(): Integration {
    return new Integration({ ...this.props, status: 'EXPIRED', lastHealthOk: false });
  }

  revoke(): Integration {
    return new Integration({ ...this.props, status: 'REVOKED', lastHealthOk: false });
  }

  isUsable(): boolean {
    return this.props.status === 'CONNECTED' || this.props.status === 'DEGRADED';
  }

  isExpiringSoon(): boolean {
    if (!this.props.expiresAt) return false;
    const ms = this.props.expiresAt.getTime() - Date.now();
    return ms > 0 && ms < 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  get id() { return this.props.id; }
  get orgId() { return this.props.orgId; }
  get provider() { return this.props.provider; }
  get status() { return this.props.status; }
  get externalAccountIds() { return this.props.externalAccountIds; }
  get scopes() { return this.props.scopes; }
  get expiresAt() { return this.props.expiresAt; }
  get lastHealthOk() { return this.props.lastHealthOk; }
  toProps(): IntegrationProps { return { ...this.props }; }
}
