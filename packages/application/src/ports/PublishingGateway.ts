import type { Channel } from '@nextface/schemas';
import type { CreativeAssets } from '@nextface/domain';

export interface PublishParams {
  channel: Channel;
  assets: CreativeAssets;
  copy: { primary: string; headline: string; cta: string };
  orgId: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface PublishResult {
  externalId: string;
  url?: string;
  publishedAt: Date;
}

export interface PublishingGateway {
  publish(params: PublishParams, credentials: Record<string, string>): Promise<PublishResult>;
  pause(externalId: string, credentials: Record<string, string>): Promise<void>;
  delete(externalId: string, credentials: Record<string, string>): Promise<void>;
}
