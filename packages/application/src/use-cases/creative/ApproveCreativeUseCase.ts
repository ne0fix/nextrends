import { NotFoundError, ForbiddenError } from '@nextface/domain';
import type { CreativeRepository } from '../../ports/CreativeRepository';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface ApproveCreativeInput {
  orgId: string;
  actorId: string;
  creativeId: string;
  approved: boolean;
  reason?: string;
}

export interface ApproveCreativeOutput {
  creativeId: string;
  status: string;
}

export class ApproveCreativeUseCase {
  constructor(
    private readonly creatives: CreativeRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: ApproveCreativeInput): Promise<ApproveCreativeOutput> {
    const creative = await this.creatives.findById(input.creativeId);
    if (!creative) throw new NotFoundError('Creative', input.creativeId);
    if (creative.orgId !== input.orgId) throw new ForbiddenError('creative belongs to different org');

    const updated = input.approved ? creative.approve() : creative.reject();
    await this.creatives.update(updated);

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: input.approved ? 'creative.approved' : 'creative.rejected',
      resourceType: 'Creative',
      resourceId: input.creativeId,
      after: { status: updated.status, reason: input.reason },
    });

    return { creativeId: input.creativeId, status: updated.status };
  }
}
