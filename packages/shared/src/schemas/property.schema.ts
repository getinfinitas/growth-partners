import { z } from 'zod'

// Enums matching database
export const PropertyTypeEnum = z.enum(['retail', 'office', 'industrial', 'residential', 'mixed_use', 'land'])

// Full property schema
export const PropertySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  
  // Property details
  name: z.string().nullable(),
  description: z.string().nullable(),
  property_type: PropertyTypeEnum,
  
  // Address (required for properties)
  address_line_1: z.string().min(1),
  address_line_2: z.string().nullable(),
  locality: z.string().min(1), // City
  administrative_area: z.string().min(1), // State/Province
  postal_code: z.string().min(1),
  country_code: z.string().length(2).default('US'),
  
  // Geographic data
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  
  // Property specifics
  square_feet: z.number().int().positive().nullable(),
  lot_size: z.number().positive().nullable(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 5).nullable(),
  
  // Financial data
  purchase_price: z.number().positive().nullable(),
  current_value: z.number().positive().nullable(),
  
  // Associated contacts
  owner_contact_id: z.string().uuid().nullable(),
  manager_contact_id: z.string().uuid().nullable(),
  
  // Metadata
  tags: z.array(z.string()).nullable(),
  custom_fields: z.record(z.any()).nullable(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new property
export const CreatePropertySchema = PropertySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Schema for updating a property
export const UpdatePropertySchema = PropertySchema.partial().required({ id: true })

// Type exports
export type Property = z.infer<typeof PropertySchema>
export type CreateProperty = z.infer<typeof CreatePropertySchema>
export type UpdateProperty = z.infer<typeof UpdatePropertySchema>
export type PropertyType = z.infer<typeof PropertyTypeEnum>
