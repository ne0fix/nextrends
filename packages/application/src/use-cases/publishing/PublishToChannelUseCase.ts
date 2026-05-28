import { NotFoundError, ForbiddenError } from '@nextface/domain';
import type { CreativeRepository } from '../../ports/CreativeRepository';
import type { IntegrationRepository } from '../../ports/IntegrationRepository';
import type { PublishingGateway } from '../../ports/PublishingGateway';
import type { PublicationRepository } from '../../ports/PublicationRepository';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';
import type { Channel } from '@nextface/schemas';

const META_CHANNELS = new Set([
  'META_FEED', 'META_REELS', 'META_ADS', 'META_STORIES',
  'IG_FEED', 'IG_REELS', 'IG_STORIES',
]);

function providerFromChannel(channel: string): string {
  if (META_CHANNELS.has(channel)) return 'META';
  if (channel.startsWith('TIKTOK')) return 'TIKTOK';
  if (channel.startsWith('YOUTUBE')) return 'YOUTUBE';
  if (channel === 'WHATSAPP') return 'WHATSAPP';
  if (channel === 'TELEGRAM') return 'TELEGRAM';
  return 'META';
}

export interface EncryptionService {
  decrypt(buf: Buffer): Promise<Record<string, string>>;
}

export interface PublishToChannelInput {
  orgId: string;
  actorId: string;
  creativeId: string;
  channel: string;
  scheduledAt?: Date;
  idempotencyKey?: string;
}

export interface PublishToChannelOutput {
  publicationId: string;
  status: string;
  externalId?: string;
}

export class PublishToChannelUseCase {
  constructor(
    private readonly creatives: CreativeRepository,
    private readonly integrations: IntegrationRepository,
    private readonly publishing: PublishingGateway,
    private readonly publications: PublicationRepository,
    private readonly encryption: EncryptionService,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: PublishToChannelInput): Promise<PublishToChannelOutput> {
    const creative = await this.creatives.findById(input.creativeId);
    if (!creative) throw new NotFoundError('Creative', input.creativeId);
    if (creative.orgId !== input.orgId) throw new ForbiddenError('creative belongs to different org');

    const provider = providerFromChannel(input.channel);
    const integration = await this.integrations.findByOrgAndProvider(input.orgId, provider as never);
    if (!integration || !integration.isUsable()) {
      throw new Error(`Integration for ${provider} not connected or unavailable`);
    }

    const encBuf = await this.integrations.getEncryptedCredentials(integration.id);
    if (!encBuf) throw new Error('Integration credentials not found');
    const credentials = await this.encryption.decrypt(encBuf);

    const publicationId = crypto.randomUUID();
    const isScheduled = input.scheduledAt && input.scheduledAt > new Date();

    await this.publications.save({
      id: publicationId,
      orgId: input.orgId,
      creativeId: input.creativeId,
      channel: input.channel,
      status: isScheduled ? 'QUEUED' : 'PUBLISHING',
      scheduledAt: input.scheduledAt,
      metadata: { idempotencyKey: input.idempotencyKey },
    });

    if (isScheduled) {
      return { publicationId, status: 'QUEUED' };
    }

    const result = await this.publishing.publish(
      {
        channel: input.channel as Channel,
        assets: creative.assets,
        copy: creative.assets.copies,
        orgId: input.orgId,
        idempotencyKey: input.idempotencyKey,
      },
      credentials,
    );

    await this.publications.updateStatus(publicationId, 'PUBLISHED', result.externalId);

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'creative.published',
      resourceType: 'Publication',
      resourceId: publicationId,
      after: { channel: input.channel, externalId: result.externalId },
    });

    return { publicationId, status: 'PUBLISHED', externalId: result.externalId };
  }
}
