import { z } from 'zod';

export const ProductSourceSchema = z.enum([
  'KIWIFY', 'HOTMART', 'EDUZZ', 'MONETIZZE', 'HEROSPARK', 'TICTO',
]);

export const ProductDossierSchema = z.object({
  targetAudience: z.string(),
  pains: z.array(z.string()),
  benefits: z.array(z.string()),
  objections: z.array(z.string()),
  triggers: z.array(z.string()),
  proofPoints: z.array(z.string()),
  competitorAngles: z.array(z.string()).default([]),
});
export type ProductDossier = z.infer<typeof ProductDossierSchema>;

export const ComputeHotScoreInputSchema = z.object({
  productId: z.string(),
  force: z.boolean().default(false),
});

export const IndexProductInputSchema = z.object({
  source: ProductSourceSchema,
  externalId: z.string(),
  name: z.string(),
  niche: z.string(),
  rawData: z.record(z.unknown()),
});
