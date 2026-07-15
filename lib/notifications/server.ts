import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationData, NotificationType } from "@/lib/actions/notifications";

/** Server-only notification helpers for trusted actions and scheduled jobs. */
export async function createNotification(data: NotificationData) {
  const admin = createAdminClient();
  const { data: notification, error } = await admin
    .from("user_notifications")
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
    console.error("[Notification Error]", error);
    return { success: false, error };
  }
  return { success: true, data: notification };
}

export async function getNotificationsForDigest(userId: string, types: NotificationType[], since: Date) {
  const { data, error } = await createAdminClient()
    .from("user_notifications")
    .select("*")
    .eq("user_id", userId)
    .in("type", types)
    .gte("created_at", since.toISOString())
    .is("read_at", null)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error };
  return { success: true, data: data || [] };
}

export async function deleteOldNotifications(olderThanDays = 30) {
  const safeDays = Math.max(1, Math.min(olderThanDays, 3650));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - safeDays);
  const { error, count } = await createAdminClient()
    .from("user_notifications")
    .delete()
    .lt("created_at", cutoff.toISOString());
  if (error) return { success: false, error };
  return { success: true, count };
}

export async function recordDigestSend(
  userId: string,
  organizationId: string,
  digestType: string,
  status: "sent" | "failed" = "sent",
) {
  const { error } = await createAdminClient().from("email_digests").upsert({
    user_id: userId,
    organization_id: organizationId,
    digest_date: new Date().toISOString().split("T")[0],
    notification_type: digestType,
    sent_at: new Date().toISOString(),
    status,
    retry_count: 0,
  });
  if (error) return { success: false, error };
  return { success: true };
}
