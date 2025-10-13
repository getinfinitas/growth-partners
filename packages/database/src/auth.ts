import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';
import type { NextRequest } from 'next/server';

// Client-side Supabase client for authentication and user operations
export function createAuthClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}

// Server-side Supabase client for API operations (service role)
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper to get authenticated user from request headers
export async function getAuthenticatedUser(request: NextRequest) {
  const authClient = createAuthClient();

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await authClient.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Helper to get user's organization data
export async function getUserOrganization(userId: string) {
  const serverClient = createServerClient();
  
  const { data: userData, error } = await serverClient
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (error || !userData?.organization_id) {
    return null;
  }

  return userData.organization_id;
}