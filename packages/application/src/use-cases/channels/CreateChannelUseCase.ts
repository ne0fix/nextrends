import { NotFoundError } from '@nextface/domain';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface ChannelRepository {
  create(channel: ChannelData): Promise<ChannelData>;
  findById(id: string): Promise<ChannelData | null>;
  findByOrg(orgId: string): Promise<ChannelData[]>;
  updateStatus(id: string, status: string, phase?: string): Promise<void>;
}

export interface ChannelData {
  id: string;
  orgId: string;
  provider: string;
  externalId?: string;
  handle: string;
  brandDna: Record<string, unknown>;
  status: string;
  phase: string;
  followers: number;
}

export interface CreateChannelInput {
  orgId: string;
  actorId: string;
  provider: string;
  handle: string;
  brandDna?: Record<string, unknown>;
}

export class CreateChannelUseCase {
  constructor(
    private readonly channels: ChannelRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: CreateChannelInput): Promise<{ channelId: string }> {
    const id = crypto.randomUUID();
    await this.channels.create({
      id,
      orgId: input.orgId,
      provider: input.provider,
      handle: input.handle,
      brandDna: input.brandDna ?? {},
      status: 'PLANNED',
      phase: 'IGNITION',
      followers: 0,
    });

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'channel.created',
      resourceType: 'SocialChannel',
      resourceId: id,
      after: { provider: input.provider, handle: input.handle },
    });

    return { channelId: id };
  }
}
