import { z } from 'zod';

export const ChannelSchema = z.enum([
  'META_FEED', 'META_REELS', 'META_STORIES', 'META_ADS',
  'IG_FEED', 'IG_REELS', 'IG_STORIES',
  'TIKTOK_ORGANIC', 'TIKTOK_ADS',
  'YOUTUBE_SHORTS', 'YOUTUBE_LONG', 'YOUTUBE_ADS',
  'WHATSAPP', 'TELEGRAM', 'FACEBOOK_GROUP',
]);
export type Channel = z.infer<typeof ChannelSchema>;

export const PublicationStatusSchema = z.enum([
  'QUEUED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'PAUSED',
]);

export const PublishCreativeInputSchema = z.object({
  orgId: z.string(),
  creativeId: z.string(),
  channel: ChannelSchema,
  scheduledAt: z.date().optional(),
  metadata: z.record(z.unknown()).default({}),
  idempotencyKey: z.string().optional(),
});

export const RepostInputSchema = z.object({
  orgId: z.string(),
  publicationId: z.string(),
  alternateScheduledAt: z.date().optional(),
  alternateCopy: z.string().optional(),
});
