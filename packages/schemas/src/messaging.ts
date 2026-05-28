import { z } from 'zod';

export const MessagingProviderSchema = z.enum(['WHATSAPP', 'TELEGRAM']);

export const SendMessageInputSchema = z.object({
  orgId: z.string(),
  provider: MessagingProviderSchema,
  to: z.string(),
  templateName: z.string().optional(),
  templateParams: z.array(z.string()).optional(),
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
});

export const CreateMessagingFlowInputSchema = z.object({
  orgId: z.string(),
  provider: MessagingProviderSchema,
  name: z.string().min(2),
  steps: z.array(z.object({
    order: z.number().int(),
    delayHours: z.number().default(0),
    templateName: z.string().optional(),
    text: z.string().optional(),
    condition: z.string().optional(),
  })),
});
