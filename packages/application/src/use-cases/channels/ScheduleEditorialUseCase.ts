import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface EditorialRepository {
  create(item: EditorialItemData): Promise<EditorialItemData>;
  findByChannel(channelId: string, opts?: { from?: Date; limit?: number }): Promise<EditorialItemData[]>;
  updateStatus(id: string, status: string): Promise<void>;
}

export interface EditorialItemData {
  id: string;
  channelId: string;
  creativeId?: string;
  scheduledAt: Date;
  status: string;
  caption?: string;
  hashtags: string[];
}

export interface ScheduleEditorialInput {
  orgId: string;
  actorId: string;
  channelId: string;
  creativeId?: string;
  scheduledAt: Date;
  caption?: string;
  hashtags?: string[];
}

export class ScheduleEditorialUseCase {
  constructor(
    private readonly editorial: EditorialRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: ScheduleEditorialInput): Promise<{ itemId: string }> {
    const id = crypto.randomUUID();
    await this.editorial.create({
      id,
      channelId: input.channelId,
      creativeId: input.creativeId,
      scheduledAt: input.scheduledAt,
      status: 'QUEUED',
      caption: input.caption,
      hashtags: input.hashtags ?? [],
    });

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'editorial.scheduled',
      resourceType: 'EditorialItem',
      resourceId: id,
      after: { channelId: input.channelId, scheduledAt: input.scheduledAt },
    });

    return { itemId: id };
  }
}
