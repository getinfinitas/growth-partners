/**
 * Super Admin Helper Functions
 * 
 * These functions help you check and require super admin access
 * in your API routes and server components.
 */

import { createServerClient } from './index'

/**
 * Check if a user is a super admin
 * @param userId - User ID to check
 * @returns Promise<boolean> - True if user is super admin
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return (data as any).is_super_admin === true
}

/**
 * Require super admin access (throws error if not authorized)
 * Use this at the start of admin-only routes/functions
 * 
 * @param userId - User ID to check
 * @throws Error if user is not a super admin
 */
export async function requireSystemAdmin(userId: string): Promise<void> {
  const isAdmin = await isSystemAdmin(userId)
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Super admin access required')
  }
}

/**
 * Get system-wide statistics (super admin only)
 * @param userId - User ID (must be super admin)
 * @returns Promise with system stats
 */
export async function getSystemStats(userId: string) {
  await requireSystemAdmin(userId)
  
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('admin_system_stats' as any)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to fetch system stats: ${error.message}`)
  }

  return data
}

/**
 * Get all organizations (super admin only)
 * Includes pagination support
 */
export async function getAllOrganizations(
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  await requireSystemAdmin(userId)
  
  const supabase = createServerClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`)
  }

  return {
    organizations: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

/**
 * Get all users (super admin only)
 * Includes pagination support
 */
export async function getAllUsers(
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  await requireSystemAdmin(userId)
  
  const supabase = createServerClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('users')
    .select('id, email, full_name, role, pricing_tier, organization_id, created_at, is_super_admin', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return {
    users: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

/**
 * Get organization by ID (super admin only)
 * Includes related data
 */
export async function getOrganizationById(
  userId: string,
  organizationId: string
) {
  await requireSystemAdmin(userId)
  
  const supabase = createServerClient()

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (orgError) {
    throw new Error(`Failed to fetch organization: ${orgError.message}`)
  }

  // Get related counts
  const [contactsCount, propertiesCount, activitiesCount, usersCount] = await Promise.all([
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    (supabase as any).from('properties').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('activities').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
  ])

  return {
    organization: org,
    stats: {
      contacts: contactsCount.count || 0,
      properties: propertiesCount.count || 0,
      activities: activitiesCount.count || 0,
      users: usersCount.count || 0,
    },
  }
}

/**
 * Grant super admin access to a user
 * @param currentUserId - Current super admin's user ID
 * @param targetUserId - User ID to grant admin access to
 */
export async function grantSuperAdmin(
  currentUserId: string,
  targetUserId: string
): Promise<void> {
  await requireSystemAdmin(currentUserId)
  
  const supabase = createServerClient()

  const { error } = await (supabase as any).rpc('grant_super_admin', {
    user_id: targetUserId,
  })

  if (error) {
    throw new Error(`Failed to grant super admin: ${error.message}`)
  }
}

/**
 * Revoke super admin access from a user
 * @param currentUserId - Current super admin's user ID
 * @param targetUserId - User ID to revoke admin access from
 */
export async function revokeSuperAdmin(
  currentUserId: string,
  targetUserId: string
): Promise<void> {
  await requireSystemAdmin(currentUserId)
  
  if (currentUserId === targetUserId) {
    throw new Error('Cannot revoke your own super admin access')
  }

  const supabase = createServerClient()

  const { error } = await (supabase as any).rpc('revoke_super_admin', {
    user_id: targetUserId,
  })

  if (error) {
    throw new Error(`Failed to revoke super admin: ${error.message}`)
  }
}

/**
 * Search across all organizations (super admin only)
 */
export async function searchOrganizations(
  userId: string,
  query: string,
  limit: number = 20
) {
  await requireSystemAdmin(userId)
  
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, email, phone, created_at')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    throw new Error(`Search failed: ${error.message}`)
  }

  return data
}
