"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
 * Create a new notification in the database
 */
export async function createNotification(data: NotificationData) {
  const admin = createAdminClient();

  const { data: notification, error } = await admin
    .from('user_notifications')
    .insert({
      user_id: data.userId,
      organization_id: data.organizationId,
      type: data.type,
      title: data.title,
      message: data.message,
      related_entity_type: data.relatedEntityType || null,
      related_entity_id: data.relatedEntityId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return { success: true, data: notification };
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

/**
 * Get notifications by type for digest generation
 */
export async function getNotificationsForDigest(
  userId: string,
  types: NotificationType[],
  since: Date,
) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .in('type', types)
    .gte('created_at', since.toISOString())
    .is('read_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return { success: true, data: data || [] };
}

/**
 * Delete old notifications (cleanup)
 */
export async function deleteOldNotifications(olderThanDays: number = 30) {
  const admin = createAdminClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const { error, count } = await admin
    .from('user_notifications')
    .delete()
    .lt('created_at', cutoffDate.toISOString());

  if (error) {
    console.error('[Notification Error]', error);
    return { success: false, error };
  }

  return { success: true, count };
}

/**
 * Record digest email send
 */
export async function recordDigestSend(
  userId: string,
  organizationId: string,
  digestType: string,
  status: 'sent' | 'failed' = 'sent'
) {
  const admin = createAdminClient();

  const today = new Date().toISOString().split('T')[0];

  const { error } = await admin
    .from('email_digests')
    .upsert({
      user_id: userId,
      organization_id: organizationId,
      digest_date: today,
      notification_type: digestType,
      sent_at: new Date().toISOString(),
      status,
      retry_count: 0,
    });

  if (error) {
    console.error('[Digest Error]', error);
    return { success: false, error };
  }

  return { success: true };
}
