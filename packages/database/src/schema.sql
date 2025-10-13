-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user', 'guest');
CREATE TYPE pricing_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE contact_type AS ENUM ('person', 'company');
CREATE TYPE property_type AS ENUM ('retail', 'office', 'industrial', 'residential', 'mixed_use', 'land');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'gbp_sync');
CREATE TYPE gbp_status AS ENUM ('pending', 'verified', 'suspended', 'disabled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    pricing_tier pricing_tier DEFAULT 'free',
    organization_id UUID,
    gbp_profile_id UUID,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table (GBP Business Profile aligned)
CREATE TABLE public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    phone TEXT,
    email TEXT,
    
    -- GBP Business Profile fields
    gbp_account_id TEXT,
    gbp_location_id TEXT,
    business_status gbp_status DEFAULT 'pending',
    
    -- Address components (GBP aligned)
    address_line_1 TEXT,
    address_line_2 TEXT,
    locality TEXT, -- City
    administrative_area TEXT, -- State/Province  
    postal_code TEXT,
    country_code TEXT DEFAULT 'US',
    
    -- Geographic coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Business categories (GBP categories)
    primary_category TEXT,
    additional_categories TEXT[],
    
    -- Business hours (JSON format for flexibility)
    business_hours JSONB,
    
    -- Social profiles
    social_profiles JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table (People and Companies)
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    contact_type contact_type NOT NULL,
    
    -- Basic info
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    
    -- Address (can differ from organization)
    address_line_1 TEXT,
    address_line_2 TEXT,
    locality TEXT,
    administrative_area TEXT,
    postal_code TEXT,
    country_code TEXT DEFAULT 'US',
    
    -- Additional fields
    website_url TEXT,
    social_profiles JSONB,
    notes TEXT,
    tags TEXT[],
    
    -- Relationship data
    company_id UUID REFERENCES contacts(id), -- For people linked to companies
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table (Real estate/locations)
CREATE TABLE public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    -- Property details
    name TEXT,
    description TEXT,
    property_type property_type NOT NULL,
    
    -- Address
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    locality TEXT NOT NULL,
    administrative_area TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country_code TEXT DEFAULT 'US',
    
    -- Geographic data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property specifics
    square_feet INTEGER,
    lot_size DECIMAL(10, 2),
    year_built INTEGER,
    
    -- Financial data
    purchase_price DECIMAL(12, 2),
    current_value DECIMAL(12, 2),
    
    -- Associated contacts
    owner_contact_id UUID REFERENCES contacts(id),
    manager_contact_id UUID REFERENCES contacts(id),
    
    -- Metadata
    tags TEXT[],
    custom_fields JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (Communications and actions)
CREATE TABLE public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type activity_type NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    
    -- Related entities
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- GBP integration
    gbp_post_id TEXT,
    gbp_review_id TEXT,
    gbp_message_id TEXT,
    
    -- Metadata
    tags TEXT[],
    attachments JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GBP Profiles table (Google Business Profile integration)
CREATE TABLE public.gbp_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    -- GBP identifiers
    account_id TEXT NOT NULL,
    location_id TEXT,
    account_name TEXT,
    location_name TEXT,
    
    -- Status and verification
    verification_status gbp_status DEFAULT 'pending',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    
    -- OAuth tokens (encrypted)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Profile data cache
    profile_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(account_id, location_id)
);

-- Pricing tiers configuration
CREATE TABLE public.pricing_tiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tier pricing_tier UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(8, 2),
    price_yearly DECIMAL(8, 2),
    
    -- Feature limits
    max_contacts INTEGER,
    max_properties INTEGER,
    max_users INTEGER,
    features JSONB,
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_gbp_profile_id ON users(gbp_profile_id);
CREATE INDEX idx_organizations_gbp_account_id ON organizations(gbp_account_id);
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_properties_organization_id ON properties(organization_id);
CREATE INDEX idx_properties_owner_contact_id ON properties(owner_contact_id);
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_property_id ON activities(property_id);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);
CREATE INDEX idx_gbp_profiles_organization_id ON gbp_profiles(organization_id);
CREATE INDEX idx_gbp_profiles_account_id ON gbp_profiles(account_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gbp_profiles_updated_at BEFORE UPDATE ON gbp_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gbp_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their organization's data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view org data" ON organizations FOR SELECT 
USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org contacts" ON contacts FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org properties" ON properties FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org activities" ON activities FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org gbp profiles" ON gbp_profiles FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));