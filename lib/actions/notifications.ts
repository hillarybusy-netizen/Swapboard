"use server";

import { createClient } from "@/lib/supabase/server";

export type NotificationType =
  | 'shift_assigned'
  | 'shift_claim_requested'
  | 'shift_claim_approved'
  | 'shift_claim_rejected'
  | 'shift_completion_pending'
  | 'completion_approved'
  | 'completion_rejected'
  | 'swap_posted'
  | 'cover_offered'
  | 'swap_approval_pending'
  | 'swap_approved'
  | 'swap_rejected'
  | 'swap_cancelled'
  | 'shift_starting_soon'
  | 'shift_overdue'
  | 'pending_approvals_digest'
  | 'upcoming_shifts_digest';

export type NotificationEntityType = 'shift' | 'swap_request';

export interface NotificationData {
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: NotificationEntityType;
  relatedEntityId?: string;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * Mark all notifications of a type as read
 */
export async function markNotificationsTypeAsRead(type: NotificationType) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('type', type)
    .is('read_at', null)
    .select();

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return { success: true, count: data?.length || 0 };
}

/**
 * Get paginated notifications for a user
 */
export async function getUserNotifications(
  userId?: string,
  limit: number = 20,
  offset: number = 0,
  filter?: {
    type?: NotificationType;
    unreadOnly?: boolean;
    startDate?: string;
    endDate?: string;
  }
) {
  const supabase = await createClient();

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    userId = user.id;
  }

  let query = supabase
    .from('user_notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter?.type) {
    query = query.eq('type', filter.type);
  }

  if (filter?.unreadOnly) {
    query = query.is('read_at', null);
  }

  if (filter?.startDate) {
    query = query.gte('created_at', filter.startDate);
  }

  if (filter?.endDate) {
    query = query.lte('created_at', filter.endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return {
    success: true,
    data: data || [],
    total: count || 0,
    hasMore: (offset + limit) < (count || 0),
  };
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadNotificationCount(userId?: string) {
  const supabase = await createClient();

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    userId = user.id;
  }

  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return { success: true, count: count || 0 };
}
