import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface FlowStep {
  id: string;
  type: 'message' | 'question' | 'delay' | 'condition' | 'action';
  content?: string;
  delay?: number;
  branches?: Array<{ condition: string; nextStepId: string }>;
  nextStepId?: string;
}

export interface MessagingFlowRepository {
  create(flow: FlowData): Promise<FlowData>;
  findById(id: string): Promise<FlowData | null>;
  findByOrg(orgId: string): Promise<FlowData[]>;
  update(flow: FlowData): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface FlowData {
  id: string;
  orgId: string;
  provider: string;
  name: string;
  steps: FlowStep[];
  metrics: Record<string, unknown>;
}

export interface CreateFlowInput {
  orgId: string;
  actorId: string;
  provider: string;
  name: string;
  steps: FlowStep[];
}

export class CreateFlowUseCase {
  constructor(
    private readonly flows: MessagingFlowRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: CreateFlowInput): Promise<{ flowId: string }> {
    const id = crypto.randomUUID();
    await this.flows.create({
      id,
      orgId: input.orgId,
      provider: input.provider,
      name: input.name,
      steps: input.steps,
      metrics: {},
    });

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'flow.created',
      resourceType: 'MessagingFlow',
      resourceId: id,
      after: { name: input.name, provider: input.provider, steps: input.steps.length },
    });

    return { flowId: id };
  }
}
