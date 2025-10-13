'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createAuthClient } from '@infinitas/database'
import type { User as CRMUser } from '@infinitas/shared'
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: SupabaseUser | null;
  crmUser: CRMUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [crmUser, setCrmUser] = useState<CRMUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createAuthClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchCRMUser(session.user.id);
      }
      
      setLoading(false);
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        await fetchCRMUser(session.user.id);
      } else {
        setUser(null);
        setCrmUser(null);
      }
      setLoading(false);
    });

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const fetchCRMUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching CRM user:', error);
        return;
      }

      // Transform snake_case database fields to camelCase
      if (data) {
        const transformedUser: CRMUser = {
          id: data.id,
          email: data.email,
          fullName: data.full_name ?? undefined,
          avatarUrl: data.avatar_url ?? undefined,
          role: data.role,
          pricingTier: data.pricing_tier,
          organizationId: data.organization_id ?? undefined,
          gbpProfileId: data.gbp_profile_id ?? undefined,
          onboardingCompleted: data.onboarding_completed,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        setCrmUser(transformedUser);
      }
    } catch (error) {
      console.error('Error fetching CRM user:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    crmUser,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}