import { z } from 'zod'

// Enums matching database
export const UserRoleEnum = z.enum(['admin', 'manager', 'user', 'guest', 'system_admin'])
export const PricingTierEnum = z.enum(['free', 'basic', 'pro', 'enterprise'])

// Full user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  role: UserRoleEnum.default('user'),
  pricing_tier: PricingTierEnum.default('free'),
  organization_id: z.string().uuid().nullable(),
  gbp_profile_id: z.string().uuid().nullable(),
  onboarding_completed: z.boolean().default(false),
  is_super_admin: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new user (omit auto-generated fields)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Schema for updating a user (all fields optional except id)
export const UpdateUserSchema = UserSchema.partial().required({ id: true })

// Schema for user profile updates (only user-editable fields)
export const UpdateUserProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().optional(),
})

// Type exports
export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>
export type UserRole = z.infer<typeof UserRoleEnum>
export type PricingTier = z.infer<typeof PricingTierEnum>
