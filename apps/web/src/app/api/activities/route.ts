import { NextRequest, NextResponse } from 'next/server';
import type { ActivityFormData } from '@infinitas/shared';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, { supabase, organizationId }) => {
  // Parse query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const sortBy = url.searchParams.get('sortBy') || 'created_at';
  const sortOrder = url.searchParams.get('sortOrder') || 'desc';
  const activityType = url.searchParams.get('activityType');
  const contactId = url.searchParams.get('contactId');
  const propertyId = url.searchParams.get('propertyId');

  let query = supabase
    .from('activities')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, company_name, contact_type),
      property:properties(id, name, address_line_1, locality, administrative_area)
    `)
    .eq('organization_id', organizationId);

  // Apply filters
  if (activityType) {
    query = query.eq('activity_type', activityType as 'call' | 'email' | 'meeting' | 'note' | 'task' | 'gbp_sync');
  }
  if (contactId) {
    query = query.eq('contact_id', contactId);
  }
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  // Apply sorting and pagination
  const { data: activities, error, count } = await query
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
    data: activities,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

export const POST = withAuth(async (request, { supabase, organizationId, user }) => {
  const activityData: ActivityFormData = await request.json();

  // Prepare the activity data
  const newActivity = {
    organization_id: organizationId,
    user_id: user.id,
    activity_type: activityData.activityType,
    subject: activityData.subject,
    description: activityData.description,
    contact_id: activityData.contactId,
    property_id: activityData.propertyId,
    scheduled_at: activityData.scheduledAt?.toISOString(),
    duration_minutes: activityData.durationMinutes,
    tags: activityData.tags || [],
  };

  const { data: activity, error } = await supabase
    .from('activities')
    .insert(newActivity)
    .select(`
      *,
      contact:contacts(id, first_name, last_name, company_name, contact_type),
      property:properties(id, name, address_line_1, locality, administrative_area)
    `)
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: activity,
    message: 'Activity created successfully',
  });
});
