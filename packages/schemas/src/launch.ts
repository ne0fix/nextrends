import { z } from 'zod';

export const LaunchTemplateKeySchema = z.enum(['express_7', 'standard_14', 'long_21']);
export type LaunchTemplateKey = z.infer<typeof LaunchTemplateKeySchema>;

export const LaunchStatusSchema = z.enum([
  'PLANNED', 'PRELAUNCH', 'WARMUP', 'CART_OPEN', 'CART_CLOSED', 'RETROSPECTIVE',
]);

export const CreateLaunchInputSchema = z.object({
  orgId: z.string(),
  productId: z.string(),
  templateKey: LaunchTemplateKeySchema,
  startsAt: z.coerce.date(),
  budgetCap: z.number().positive(),
});

export const AdvanceLaunchPhaseInputSchema = z.object({
  orgId: z.string(),
  launchId: z.string(),
  actorId: z.string(),
});
