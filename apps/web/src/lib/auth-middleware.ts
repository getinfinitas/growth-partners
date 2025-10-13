import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getAuthenticatedUser, getUserOrganization } from '@infinitas/database';

export interface AuthContext {
  user: { id: string; email?: string };
  organizationId: string;
  supabase: ReturnType<typeof createServerClient>;
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API routes with authentication
 * Eliminates repetitive auth logic across routes
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async function(request: NextRequest): Promise<NextResponse> {
    try {
      // Get authenticated user
      const user = await getAuthenticatedUser(request);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get user's organization
      const organizationId = await getUserOrganization(user.id);
      if (!organizationId) {
        return NextResponse.json(
          { success: false, error: 'No organization found' },
          { status: 400 }
        );
      }

      // Create Supabase client
      const supabase = createServerClient();

      // Call the actual handler with auth context
      return handler(request, {
        user,
        organizationId,
        supabase,
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}