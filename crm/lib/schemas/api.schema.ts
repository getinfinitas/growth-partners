import { z } from 'zod'

// ============================================
// Common API Schemas
// ============================================

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Search schema
export const SearchSchema = z.object({
  query: z.string().min(1).max(255),
  filters: z.record(z.string()).optional(),
})

// Sort schema
export const SortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('asc'),
})

// Generic API response wrapper
export const APIResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: dataSchema.nullable(),
  error: z.string().nullable(),
  message: z.string().optional(),
  meta: z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    total: z.number().optional(),
    totalPages: z.number().optional(),
  }).optional(),
})

// ============================================
// Specific API Request Schemas
// ============================================

// Contact search and filtering
export const ContactsQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  contact_type: z.enum(['person', 'company']).optional(),
  tags: z.array(z.string()).optional(),
  has_email: z.boolean().optional(),
  has_phone: z.boolean().optional(),
  company_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'first_name', 'last_name', 'company_name']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

// Properties query schema
export const PropertiesQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  property_type: z.enum(['retail', 'office', 'industrial', 'residential', 'mixed_use', 'land']).optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  min_sqft: z.coerce.number().positive().optional(),
  max_sqft: z.coerce.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'name', 'purchase_price', 'current_value']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

// Activities query schema
export const ActivitiesQuerySchema = PaginationSchema.extend({
  contact_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
  activity_type: z.enum(['call', 'email', 'meeting', 'note', 'task', 'gbp_sync']).optional(),
  completed: z.boolean().optional(),
  scheduled_from: z.string().datetime().optional(),
  scheduled_to: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'scheduled_at', 'completed_at']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

// Users query schema (super admin only)
export const UsersQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(['admin', 'manager', 'user', 'guest', 'system_admin']).optional(),
  pricing_tier: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
  organization_id: z.string().uuid().optional(),
  is_super_admin: z.boolean().optional(),
  onboarding_completed: z.boolean().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'full_name', 'email']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

// Organizations query schema (super admin only)
export const OrganizationsQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  business_status: z.enum(['pending', 'verified', 'suspended', 'disabled']).optional(),
  has_gbp: z.boolean().optional(),
  primary_category: z.string().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// Authentication & Authorization Schemas
// ============================================

// Login schema
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().default(false),
})

// Registration schema
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  ),
  full_name: z.string().min(1).max(255),
  organization_name: z.string().min(1).max(255).optional(),
})

// Password reset schema
export const ResetPasswordSchema = z.object({
  email: z.string().email(),
})

// Update password schema
export const UpdatePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  ),
  confirm_password: z.string(),
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords don't match",
    path: ["confirm_password"],
  }
)

// ============================================
// Bulk Operations Schemas
// ============================================

// Bulk delete schema
export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
})

// Bulk update tags schema
export const BulkUpdateTagsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  tags: z.array(z.string()).max(20),
  operation: z.enum(['add', 'remove', 'replace']).default('replace'),
})

// CSV import schema
export const CSVImportSchema = z.object({
  file_content: z.string(),
  mapping: z.record(z.string()), // Maps CSV columns to database fields
  skip_header: z.boolean().default(true),
  update_existing: z.boolean().default(false),
})

// ============================================
// Admin Schemas
// ============================================

// Super admin grant/revoke schema
export const AdminActionSchema = z.object({
  user_id: z.string().uuid(),
  action: z.enum(['grant', 'revoke']),
  reason: z.string().min(1).max(500).optional(),
})

// System stats response schema
export const SystemStatsSchema = z.object({
  total_users: z.number().int(),
  super_admin_count: z.number().int(),
  total_organizations: z.number().int(),
  total_contacts: z.number().int(),
  total_properties: z.number().int(),
  total_activities: z.number().int(),
  total_gbp_profiles: z.number().int(),
  new_users_30d: z.number().int(),
  new_orgs_30d: z.number().int(),
})

// ============================================
// Type Exports
// ============================================

export type Pagination = z.infer<typeof PaginationSchema>
export type Search = z.infer<typeof SearchSchema>
export type Sort = z.infer<typeof SortSchema>

export type ContactsQuery = z.infer<typeof ContactsQuerySchema>
export type PropertiesQuery = z.infer<typeof PropertiesQuerySchema>
export type ActivitiesQuery = z.infer<typeof ActivitiesQuerySchema>
export type UsersQuery = z.infer<typeof UsersQuerySchema>
export type OrganizationsQuery = z.infer<typeof OrganizationsQuerySchema>

export type Login = z.infer<typeof LoginSchema>
export type Register = z.infer<typeof RegisterSchema>
export type ResetPassword = z.infer<typeof ResetPasswordSchema>
export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>

export type BulkDelete = z.infer<typeof BulkDeleteSchema>
export type BulkUpdateTags = z.infer<typeof BulkUpdateTagsSchema>
export type CSVImport = z.infer<typeof CSVImportSchema>

export type AdminAction = z.infer<typeof AdminActionSchema>
export type SystemStats = z.infer<typeof SystemStatsSchema>

// Generic API response type
export type APIResponse<T> = {
  data: T | null
  error: string | null
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}