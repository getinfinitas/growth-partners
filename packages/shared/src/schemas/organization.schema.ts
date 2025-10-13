import { z } from 'zod'

// Enums matching database
export const GBPStatusEnum = z.enum(['pending', 'verified', 'suspended', 'disabled'])

// Address components schema (reusable)
export const AddressSchema = z.object({
  address_line_1: z.string().nullable(),
  address_line_2: z.string().nullable(),
  locality: z.string().nullable(), // City
  administrative_area: z.string().nullable(), // State/Province
  postal_code: z.string().nullable(),
  country_code: z.string().length(2).default('US'),
})

// Geographic coordinates schema
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
})

// Full organization schema
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  website_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  
  // GBP Business Profile fields
  gbp_account_id: z.string().nullable(),
  gbp_location_id: z.string().nullable(),
  business_status: GBPStatusEnum.default('pending'),
  
  // Address components (GBP aligned)
  address_line_1: z.string().nullable(),
  address_line_2: z.string().nullable(),
  locality: z.string().nullable(),
  administrative_area: z.string().nullable(),
  postal_code: z.string().nullable(),
  country_code: z.string().length(2).default('US'),
  
  // Geographic coordinates
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  
  // Business categories
  primary_category: z.string().nullable(),
  additional_categories: z.array(z.string()).nullable(),
  
  // Business hours (JSON format)
  business_hours: z.record(z.any()).nullable(),
  
  // Social profiles (JSON format)
  social_profiles: z.record(z.any()).nullable(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new organization
export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Schema for updating an organization
export const UpdateOrganizationSchema = OrganizationSchema.partial().required({ id: true })

// Type exports
export type Organization = z.infer<typeof OrganizationSchema>
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>
export type GBPStatus = z.infer<typeof GBPStatusEnum>
export type Address = z.infer<typeof AddressSchema>
export type Coordinates = z.infer<typeof CoordinatesSchema>
