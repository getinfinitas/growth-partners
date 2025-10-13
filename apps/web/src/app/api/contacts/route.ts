import { NextRequest, NextResponse } from 'next/server';
import type { ContactFormData } from '@infinitas/shared';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, { supabase, organizationId }) => {
  // Parse query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const sortBy = url.searchParams.get('sortBy') || 'created_at';
  const sortOrder = url.searchParams.get('sortOrder') || 'desc';
  const contactType = url.searchParams.get('contactType');

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('organization_id', organizationId);

  // Filter by contact type if specified
  if (contactType && ['person', 'company'].includes(contactType)) {
    query = query.eq('contact_type', contactType as 'person' | 'company');
  }

  // Apply sorting and pagination
  const { data: contacts, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: contacts,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

export const POST = withAuth(async (request, { supabase, organizationId }) => {
  const contactData: ContactFormData = await request.json();

  // Prepare the contact data
  const newContact = {
    organization_id: organizationId,
    contact_type: contactData.contactType,
    first_name: contactData.firstName,
    last_name: contactData.lastName,
    company_name: contactData.companyName,
    title: contactData.title,
    email: contactData.email,
    phone: contactData.phone,
    website_url: contactData.websiteUrl,
    notes: contactData.notes,
    tags: contactData.tags || [],
    company_id: contactData.companyId,
    // Address fields
    address_line_1: contactData.address?.addressLine1,
    address_line_2: contactData.address?.addressLine2,
    locality: contactData.address?.locality,
    administrative_area: contactData.address?.administrativeArea,
    postal_code: contactData.address?.postalCode,
    country_code: contactData.address?.countryCode || 'US',
  };

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert(newContact)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: contact,
    message: 'Contact created successfully',
  });
});
