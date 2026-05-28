import { z } from 'zod';

export const OptimizerActionTypeSchema = z.enum([
  'KILL', 'SCALE', 'DUPLICATE', 'MUTATE', 'REPOST', 'REPLY',
  'PARTICIPATE', 'ROTATE', 'REFRESH_FORCED', 'BUDGET_REBALANCE',
  'PAUSE_NIGHT', 'ENRICH_CAPI',
]);
export type OptimizerActionType = z.infer<typeof OptimizerActionTypeSchema>;

export const AutonomyModeSchema = z.enum(['OBSERVER', 'COPILOT', 'AUTONOMOUS', 'SOVEREIGN']);
export type AutonomyMode = z.infer<typeof AutonomyModeSchema>;

export const RunOodaLoopInputSchema = z.object({
  orgId: z.string(),
  campaignId: z.string().optional(),
  dryRun: z.boolean().default(false),
});

export const ExecuteOptimizerActionInputSchema = z.object({
  orgId: z.string(),
  actionId: z.string(),
  actorId: z.string(),
  approved: z.boolean(),
});

export const BudgetCapSchema = z.object({
  daily: z.number().positive(),
  weekly: z.number().positive().optional(),
  monthly: z.number().positive().optional(),
  currency: z.string().default('BRL'),
});
