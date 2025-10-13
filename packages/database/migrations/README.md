# Database Migrations

This directory contains SQL migration files for Infinitas database schema changes.

## Super Admin Migration (001_add_super_admin.sql)

### What It Does

Adds super admin functionality to your Infinitas platform, allowing designated users to:
- ✅ View all organizations and their data (bypass RLS)
- ✅ Access any user's information for customer support
- ✅ View system-wide statistics and analytics
- ✅ Grant/revoke super admin access to other users
- ✅ Search across all organizations

### Why You Need This

**Critical for customer support:** Without super admin access, you cannot help customers with issues because RLS policies completely isolate each organization's data.

### How to Apply the Migration

#### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `001_add_super_admin.sql`
5. Click **Run** to execute the migration
6. Verify success (should see "Success. No rows returned")

#### Option 2: Supabase CLI

```bash
# From the project root
cd packages/database
supabase db push migrations/001_add_super_admin.sql
```

#### Option 3: Direct PostgreSQL Connection

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" < migrations/001_add_super_admin.sql
```

### Creating Your First Super Admin

After running the migration, you need to manually create your first super admin user:

1. **Create a regular user account** in your application (sign up normally)

2. **Promote to super admin** via Supabase SQL Editor:

```sql
-- Replace with your actual email
UPDATE users 
SET is_super_admin = TRUE, role = 'system_admin' 
WHERE email = 'your-admin-email@example.com';
```

3. **Verify** the super admin was created:

```sql
SELECT id, email, role, is_super_admin 
FROM users 
WHERE is_super_admin = TRUE;
```

### Creating Additional Super Admins

Once you have your first super admin, you can grant access to others programmatically:

```typescript
import { grantSuperAdmin } from '@infinitas/database'

// In an API route or server function
await grantSuperAdmin(currentAdminUserId, newAdminUserId)
```

Or via SQL:

```sql
SELECT grant_super_admin('[target-user-id]');
```

### Using Super Admin Functions

#### Check if User is Super Admin

```typescript
import { isSystemAdmin } from '@infinitas/database'

const isAdmin = await isSystemAdmin(userId)
if (isAdmin) {
  // Allow access to admin features
}
```

#### Require Super Admin Access

```typescript
import { requireSystemAdmin } from '@infinitas/database'

// Throws error if user is not super admin
await requireSystemAdmin(userId)
```

#### Get System Statistics

```typescript
import { getSystemStats } from '@infinitas/database'

const stats = await getSystemStats(adminUserId)
console.log(stats)
// {
//   total_users: 150,
//   super_admin_count: 2,
//   total_organizations: 45,
//   total_contacts: 2341,
//   ...
// }
```

#### Get All Organizations

```typescript
import { getAllOrganizations } from '@infinitas/database'

const { organizations, pagination } = await getAllOrganizations(
  adminUserId,
  page,
  limit
)
```

#### Search Organizations

```typescript
import { searchOrganizations } from '@infinitas/database'

const results = await searchOrganizations(adminUserId, 'acme')
```

### Security Notes

⚠️ **Important Security Considerations:**

1. **Limit Super Admins:** Only grant super admin access to trusted team members
2. **Audit Logging:** Consider adding audit logs for super admin actions
3. **Two-Factor Auth:** Enable 2FA for all super admin accounts
4. **Regular Reviews:** Periodically review who has super admin access
5. **Cannot Self-Revoke:** Super admins cannot remove their own access (prevents lockout)

### Database Functions Created

The migration creates these PostgreSQL functions:

- `is_super_admin()` - Check if current user is super admin
- `grant_super_admin(user_id UUID)` - Grant super admin access
- `revoke_super_admin(user_id UUID)` - Revoke super admin access

### Views Created

- `admin_system_stats` - System-wide statistics (super admin only)

### RLS Policies Added

The migration adds bypass policies for super admins on:
- `users` table
- `organizations` table
- `contacts` table
- `properties` table
- `activities` table
- `gbp_profiles` table
- `pricing_tiers` table

### Rollback

If you need to rollback this migration, uncomment and run the rollback section at the bottom of `001_add_super_admin.sql`.

**Warning:** Rollback will remove all super admin access and cannot be easily reversed.

### Testing the Migration

After applying the migration:

1. **Create a super admin user** (see instructions above)
2. **Log in as that user**
3. **Try accessing system-wide data:**

```typescript
// This should work for super admins, but not regular users
const stats = await getSystemStats(userId)
const allOrgs = await getAllOrganizations(userId)
```

4. **Verify RLS bypass** - Super admin should be able to query any organization's data
5. **Try with non-admin user** - Should get "Unauthorized" errors

### Support

If you encounter issues with the migration:

1. Check Supabase logs for error messages
2. Verify the migration ran completely (all policies should exist)
3. Confirm user has `is_super_admin = TRUE` in the database
4. Check that RLS is enabled on all tables

### Next Steps

After setting up super admin access, consider:

1. **Creating an admin dashboard** at `/admin` route
2. **Adding audit logging** for super admin actions
3. **Setting up monitoring** for super admin activity
4. **Documenting your support processes** that use super admin access
