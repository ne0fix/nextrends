import { z } from 'zod';

export const CreativeClassificationSchema = z.enum([
  'WINNER', 'PROMISING', 'STABLE', 'FATIGUED', 'LOSER',
]);
export type CreativeClassification = z.infer<typeof CreativeClassificationSchema>;

export const MetricWindowSchema = z.enum(['1D', '3D', '7D', '14D', '30D']);

export const ClassifyCreativeInputSchema = z.object({
  creativeId: z.string(),
  orgId: z.string(),
  window: MetricWindowSchema.default('7D'),
});

export const ClassifyCreativeOutputSchema = z.object({
  creativeId: z.string(),
  classification: CreativeClassificationSchema,
  confidence: z.number().min(0).max(1),
  metrics: z.object({
    ctr: z.number(),
    roas: z.number().optional(),
    frequency: z.number(),
    retention3s: z.number().optional(),
    sends: z.number().optional(),
    spend: z.number(),
  }),
  explanation: z.string(),
  suggestedAction: z.string().optional(),
});
