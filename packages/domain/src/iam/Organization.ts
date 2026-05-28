import { BusinessRuleViolation } from '../shared/DomainError';

export type Plan = 'STARTER' | 'PRO' | 'AGENCY' | 'ENTERPRISE';
export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CREATIVE' | 'FINANCE' | 'VIEWER';

const PLAN_LIMITS: Record<Plan, { channels: number; creatives: number; accounts: number }> = {
  STARTER:    { channels: 3,   creatives: 50,    accounts: 3 },
  PRO:        { channels: 10,  creatives: 300,   accounts: 10 },
  AGENCY:     { channels: 50,  creatives: 1500,  accounts: 50 },
  ENTERPRISE: { channels: Infinity, creatives: Infinity, accounts: Infinity },
};

export interface OrganizationProps {
  id: string;
  name: string;
  plan: Plan;
  createdAt: Date;
}

export class Organization {
  private constructor(private readonly props: OrganizationProps) {}

  static create(props: Omit<OrganizationProps, 'createdAt'>): Organization {
    if (!props.name.trim()) throw new BusinessRuleViolation('Organization name required');
    return new Organization({ ...props, createdAt: new Date() });
  }

  static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  canAddChannel(currentCount: number): boolean {
    return currentCount < PLAN_LIMITS[this.props.plan].channels;
  }

  canGenerateCreative(monthlyCount: number): boolean {
    return monthlyCount < PLAN_LIMITS[this.props.plan].creatives;
  }

  upgradePlan(plan: Plan): Organization {
    return new Organization({ ...this.props, plan });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get plan() { return this.props.plan; }
  get createdAt() { return this.props.createdAt; }
  toProps(): OrganizationProps { return { ...this.props }; }
}
