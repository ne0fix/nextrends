import { z } from 'zod';

export const CreativeFormatSchema = z.enum(['COPY', 'IMAGE', 'VIDEO_SHORT', 'CAROUSEL', 'VSL']);
export type CreativeFormat = z.infer<typeof CreativeFormatSchema>;

export const CreativeFrameworkSchema = z.enum(['AIDA', 'PAS', 'BAB', 'FOUR_P', 'FAB']);
export type CreativeFramework = z.infer<typeof CreativeFrameworkSchema>;

export const HookTypeSchema = z.enum([
  'COGNITIVE_DISSONANCE', 'QUESTION', 'BOLD', 'CONTRARIAN',
  'BEFORE_AFTER', 'FORBIDDEN', 'PATTERN_INTERRUPT',
]);
export type HookType = z.infer<typeof HookTypeSchema>;

export const CreativeStatusSchema = z.enum([
  'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED',
]);
export type CreativeStatus = z.infer<typeof CreativeStatusSchema>;

export const GenerateCreativeInputSchema = z.object({
  orgId: z.string(),
  productId: z.string(),
  format: CreativeFormatSchema,
  channel: z.string(),
  framework: CreativeFrameworkSchema.optional(),
  hookType: HookTypeSchema.optional(),
  angle: z.string().optional(),
  parentId: z.string().optional(),
  targetPersona: z.string().optional(),
});
export type GenerateCreativeInput = z.infer<typeof GenerateCreativeInputSchema>;

export const MutateCreativeInputSchema = z.object({
  orgId: z.string(),
  creativeId: z.string(),
  mutationType: z.enum(['HOOK', 'THUMBNAIL', 'CTA', 'MUSIC', 'COPY', 'FULL']),
  reason: z.string().optional(),
});
export type MutateCreativeInput = z.infer<typeof MutateCreativeInputSchema>;

export const ApproveCreativeInputSchema = z.object({
  orgId: z.string(),
  creativeId: z.string(),
  actorId: z.string(),
});
export type ApproveCreativeInput = z.infer<typeof ApproveCreativeInputSchema>;
