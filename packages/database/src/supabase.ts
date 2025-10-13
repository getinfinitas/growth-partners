export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          pricing_tier: Database['public']['Enums']['pricing_tier']
          organization_id: string | null
          gbp_profile_id: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          pricing_tier?: Database['public']['Enums']['pricing_tier']
          organization_id?: string | null
          gbp_profile_id?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          pricing_tier?: Database['public']['Enums']['pricing_tier']
          organization_id?: string | null
          gbp_profile_id?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          website_url: string | null
          phone: string | null
          email: string | null
          gbp_account_id: string | null
          gbp_location_id: string | null
          business_status: Database['public']['Enums']['gbp_status']
          address_line_1: string | null
          address_line_2: string | null
          locality: string | null
          administrative_area: string | null
          postal_code: string | null
          country_code: string | null
          latitude: number | null
          longitude: number | null
          primary_category: string | null
          additional_categories: string[] | null
          business_hours: Json | null
          social_profiles: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website_url?: string | null
          phone?: string | null
          email?: string | null
          gbp_account_id?: string | null
          gbp_location_id?: string | null
          business_status?: Database['public']['Enums']['gbp_status']
          address_line_1?: string | null
          address_line_2?: string | null
          locality?: string | null
          administrative_area?: string | null
          postal_code?: string | null
          country_code?: string | null
          latitude?: number | null
          longitude?: number | null
          primary_category?: string | null
          additional_categories?: string[] | null
          business_hours?: Json | null
          social_profiles?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website_url?: string | null
          phone?: string | null
          email?: string | null
          gbp_account_id?: string | null
          gbp_location_id?: string | null
          business_status?: Database['public']['Enums']['gbp_status']
          address_line_1?: string | null
          address_line_2?: string | null
          locality?: string | null
          administrative_area?: string | null
          postal_code?: string | null
          country_code?: string | null
          latitude?: number | null
          longitude?: number | null
          primary_category?: string | null
          additional_categories?: string[] | null
          business_hours?: Json | null
          social_profiles?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          contact_type: Database['public']['Enums']['contact_type']
          first_name: string | null
          last_name: string | null
          company_name: string | null
          title: string | null
          email: string | null
          phone: string | null
          address_line_1: string | null
          address_line_2: string | null
          locality: string | null
          administrative_area: string | null
          postal_code: string | null
          country_code: string | null
          website_url: string | null
          social_profiles: Json | null
          notes: string | null
          tags: string[] | null
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          contact_type: Database['public']['Enums']['contact_type']
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          title?: string | null
          email?: string | null
          phone?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          locality?: string | null
          administrative_area?: string | null
          postal_code?: string | null
          country_code?: string | null
          website_url?: string | null
          social_profiles?: Json | null
          notes?: string | null
          tags?: string[] | null
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          contact_type?: Database['public']['Enums']['contact_type']
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          title?: string | null
          email?: string | null
          phone?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          locality?: string | null
          administrative_area?: string | null
          postal_code?: string | null
          country_code?: string | null
          website_url?: string | null
          social_profiles?: Json | null
          notes?: string | null
          tags?: string[] | null
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          activity_type: Database['public']['Enums']['activity_type']
          subject: string
          description: string | null
          contact_id: string | null
          property_id: string | null
          scheduled_at: string | null
          completed_at: string | null
          duration_minutes: number | null
          gbp_post_id: string | null
          gbp_review_id: string | null
          gbp_message_id: string | null
          tags: string[] | null
          attachments: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          activity_type: Database['public']['Enums']['activity_type']
          subject: string
          description?: string | null
          contact_id?: string | null
          property_id?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          gbp_post_id?: string | null
          gbp_review_id?: string | null
          gbp_message_id?: string | null
          tags?: string[] | null
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          activity_type?: Database['public']['Enums']['activity_type']
          subject?: string
          description?: string | null
          contact_id?: string | null
          property_id?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          gbp_post_id?: string | null
          gbp_review_id?: string | null
          gbp_message_id?: string | null
          tags?: string[] | null
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'user' | 'guest'
      pricing_tier: 'free' | 'basic' | 'pro' | 'enterprise'
      contact_type: 'person' | 'company'
      property_type: 'retail' | 'office' | 'industrial' | 'residential' | 'mixed_use' | 'land'
      activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'gbp_sync'
      gbp_status: 'pending' | 'verified' | 'suspended' | 'disabled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}