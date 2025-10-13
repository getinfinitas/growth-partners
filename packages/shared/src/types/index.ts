// Base types
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';
export type PricingTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type ContactType = 'person' | 'company';
export type PropertyType = 'retail' | 'office' | 'industrial' | 'residential' | 'mixed_use' | 'land';
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'gbp_sync';
export type GBPStatus = 'pending' | 'verified' | 'suspended' | 'disabled';

// Address interface (GBP aligned)
export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  locality?: string; // City
  administrativeArea?: string; // State/Province
  postalCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}

// User interface
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
  pricingTier: PricingTier;
  organizationId?: string;
  gbpProfileId?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Organization interface (GBP Business Profile aligned)
export interface Organization extends Address {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  
  // GBP specific fields
  gbpAccountId?: string;
  gbpLocationId?: string;
  businessStatus: GBPStatus;
  
  // Business categories (GBP categories)
  primaryCategory?: string;
  additionalCategories?: string[];
  
  // Business hours in JSON format
  businessHours?: Record<string, any>;
  
  // Social profiles
  socialProfiles?: Record<string, string>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Contact interface (unified for people and companies)
export interface Contact extends Address {
  id: string;
  organizationId: string;
  contactType: ContactType;
  
  // Basic info
  firstName?: string;
  lastName?: string;
  companyName?: string;
  title?: string;
  email?: string;
  phone?: string;
  
  // Additional fields
  websiteUrl?: string;
  socialProfiles?: Record<string, string>;
  notes?: string;
  tags?: string[];
  
  // Relationship data
  companyId?: string; // For people linked to companies
  
  createdAt: Date;
  updatedAt: Date;
}

// Property interface
export interface Property extends Address {
  id: string;
  organizationId: string;
  
  // Property details
  name?: string;
  description?: string;
  propertyType: PropertyType;
  
  // Property specifics
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  
  // Financial data
  purchasePrice?: number;
  currentValue?: number;
  
  // Associated contacts
  ownerContactId?: string;
  managerContactId?: string;
  
  // Metadata
  tags?: string[];
  customFields?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Activity interface
export interface Activity {
  id: string;
  organizationId: string;
  userId?: string;
  
  // Activity details
  activityType: ActivityType;
  subject: string;
  description?: string;
  
  // Related entities
  contactId?: string;
  propertyId?: string;
  
  // Timing
  scheduledAt?: Date;
  completedAt?: Date;
  durationMinutes?: number;
  
  // GBP integration
  gbpPostId?: string;
  gbpReviewId?: string;
  gbpMessageId?: string;
  
  // Metadata
  tags?: string[];
  attachments?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// GBP Profile interface
export interface GBPProfile {
  id: string;
  organizationId: string;
  
  // GBP identifiers
  accountId: string;
  locationId?: string;
  accountName?: string;
  locationName?: string;
  
  // Status and verification
  verificationStatus: GBPStatus;
  lastSyncAt?: Date;
  syncEnabled: boolean;
  
  // OAuth tokens (these should be encrypted in storage)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // Cached profile data
  profileData?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Pricing tier configuration
export interface PricingTierConfig {
  id: string;
  tier: PricingTier;
  name: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  
  // Feature limits
  maxContacts?: number;
  maxProperties?: number;
  maxUsers?: number;
  features?: Record<string, any>;
  
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form data interfaces
export interface ContactFormData {
  contactType: ContactType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: Partial<Address>;
  websiteUrl?: string;
  notes?: string;
  tags?: string[];
  companyId?: string;
}

export interface PropertyFormData {
  name?: string;
  description?: string;
  propertyType: PropertyType;
  address: Required<Pick<Address, 'addressLine1' | 'locality' | 'administrativeArea' | 'postalCode'>> & Partial<Address>;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  purchasePrice?: number;
  currentValue?: number;
  ownerContactId?: string;
  managerContactId?: string;
  tags?: string[];
}

export interface ActivityFormData {
  activityType: ActivityType;
  subject: string;
  description?: string;
  contactId?: string;
  propertyId?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  tags?: string[];
}