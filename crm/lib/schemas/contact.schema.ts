import { z } from 'zod'

// Enums matching database
export const ContactTypeEnum = z.enum(['person', 'company'])

// Full contact schema
export const ContactSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  contact_type: ContactTypeEnum,
  
  // Basic info
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  company_name: z.string().nullable(),
  title: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  
  // Address (can differ from organization)
  address_line_1: z.string().nullable(),
  address_line_2: z.string().nullable(),
  locality: z.string().nullable(),
  administrative_area: z.string().nullable(),
  postal_code: z.string().nullable(),
  country_code: z.string().length(2).default('US'),
  
  // Additional fields
  website_url: z.string().url().nullable(),
  social_profiles: z.record(z.any()).nullable(),
  notes: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  
  // Relationship data
  company_id: z.string().uuid().nullable(), // For people linked to companies
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new contact
export const CreateContactSchema = ContactSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).refine(
  (data) => {
    // Validation: person must have first_name or last_name, company must have company_name
    if (data.contact_type === 'person') {
      return data.first_name || data.last_name
    }
    if (data.contact_type === 'company') {
      return data.company_name
    }
    return true
  },
  {
    message: 'Person must have first_name or last_name, company must have company_name',
  }
)

// Schema for updating a contact
export const UpdateContactSchema = ContactSchema.partial().required({ id: true })

// Type exports
export type Contact = z.infer<typeof ContactSchema>
export type CreateContact = z.infer<typeof CreateContactSchema>
export type UpdateContact = z.infer<typeof UpdateContactSchema>
export type ContactType = z.infer<typeof ContactTypeEnum>
