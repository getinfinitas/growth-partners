import { z } from 'zod'
import { GBPStatusEnum } from './organization.schema'

// Full GBP profile schema
export const GBPProfileSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  
  // GBP identifiers
  account_id: z.string().min(1),
  location_id: z.string().nullable(),
  account_name: z.string().nullable(),
  location_name: z.string().nullable(),
  
  // Status and verification
  verification_status: GBPStatusEnum.default('pending'),
  last_sync_at: z.string().datetime().nullable(),
  sync_enabled: z.boolean().default(true),
  
  // OAuth tokens (encrypted in database)
  access_token: z.string().nullable(),
  refresh_token: z.string().nullable(),
  token_expires_at: z.string().datetime().nullable(),
  
  // Profile data cache
  profile_data: z.record(z.any()).nullable(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new GBP profile
export const CreateGBPProfileSchema = GBPProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Schema for updating a GBP profile
export const UpdateGBPProfileSchema = GBPProfileSchema.partial().required({ id: true })

// Schema for updating OAuth tokens
export const UpdateGBPTokensSchema = z.object({
  id: z.string().uuid(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_expires_at: z.string().datetime(),
})

// Type exports
export type GBPProfile = z.infer<typeof GBPProfileSchema>
export type CreateGBPProfile = z.infer<typeof CreateGBPProfileSchema>
export type UpdateGBPProfile = z.infer<typeof UpdateGBPProfileSchema>
export type UpdateGBPTokens = z.infer<typeof UpdateGBPTokensSchema>
