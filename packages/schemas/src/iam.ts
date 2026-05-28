import { z } from 'zod';

export const PlanSchema = z.enum(['STARTER', 'PRO', 'AGENCY', 'ENTERPRISE']);
export type Plan = z.infer<typeof PlanSchema>;

export const RoleSchema = z.enum(['OWNER', 'ADMIN', 'MANAGER', 'CREATIVE', 'FINANCE', 'VIEWER']);
export type Role = z.infer<typeof RoleSchema>;

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2).max(80),
  plan: PlanSchema.default('STARTER'),
});

export const InviteMemberSchema = z.object({
  orgId: z.string().min(1),
  email: z.string().email(),
  role: RoleSchema.default('VIEWER'),
});

export const UpdateMemberRoleSchema = z.object({
  orgId: z.string().min(1),
  memberId: z.string().min(1),
  role: RoleSchema,
});
