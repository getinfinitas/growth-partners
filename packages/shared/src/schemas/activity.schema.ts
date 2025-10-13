import { z } from 'zod'

// Enums matching database
export const ActivityTypeEnum = z.enum(['call', 'email', 'meeting', 'note', 'task', 'gbp_sync'])

// Full activity schema
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  
  // Activity details
  activity_type: ActivityTypeEnum,
  subject: z.string().min(1).max(500),
  description: z.string().nullable(),
  
  // Related entities
  contact_id: z.string().uuid().nullable(),
  property_id: z.string().uuid().nullable(),
  
  // Timing
  scheduled_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  duration_minutes: z.number().int().positive().nullable(),
  
  // GBP integration
  gbp_post_id: z.string().nullable(),
  gbp_review_id: z.string().nullable(),
  gbp_message_id: z.string().nullable(),
  
  // Metadata
  tags: z.array(z.string()).nullable(),
  attachments: z.record(z.any()).nullable(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new activity
export const CreateActivitySchema = ActivitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Schema for updating an activity
export const UpdateActivitySchema = ActivitySchema.partial().required({ id: true })

// Schema for marking an activity as complete
export const CompleteActivitySchema = z.object({
  id: z.string().uuid(),
  completed_at: z.string().datetime().optional(),
})

// Type exports
export type Activity = z.infer<typeof ActivitySchema>
export type CreateActivity = z.infer<typeof CreateActivitySchema>
export type UpdateActivity = z.infer<typeof UpdateActivitySchema>
export type CompleteActivity = z.infer<typeof CompleteActivitySchema>
export type ActivityType = z.infer<typeof ActivityTypeEnum>
