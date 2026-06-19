"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Filter } from "lucide-react";
import { getUserNotifications, markNotificationAsRead, getUnreadNotificationCount, type NotificationType } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; border: string; text: string }> = {
  shift_assigned: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  swap_approved: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  swap_rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  cover_offered: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  swap_approval_pending: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
  shift_starting_soon: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  shift_overdue: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  shift_claim_requested: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  shift_claim_approved: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  shift_claim_rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  shift_completion_pending: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  completion_approved: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  completion_rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  swap_posted: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  swap_cancelled: { bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400" },
  pending_approvals_digest: { bg: "bg-gold/10", border: "border-gold/20", text: "text-gold" },
  upcoming_shifts_digest: { bg: "bg-gold/10", border: "border-gold/20", text: "text-gold" },
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      getUnreadNotificationCount().then((res) => {
        if (res.success) setUnreadCount(res.count);
      });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [filter]);

  async function loadNotifications() {
    setLoading(true);
    const result = await getUserNotifications(undefined, 20, 0, {
      unreadOnly: filter === "unread",
    });

    if (result.success) {
      setNotifications(result.data);
      const countResult = await getUnreadNotificationCount();
      if (countResult.success) setUnreadCount(countResult.count);
    }

    setLoading(false);
  }

  async function handleMarkAsRead(notificationId: string) {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  const colors = (type: NotificationType) => NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.swap_approved;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-white">Notifications</h2>
          {unreadCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{unreadCount}</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="text-xs"
          >
            Unread
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const color = colors(notification.type);
            const isUnread = !notification.read_at;

            return (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-xl border transition-colors",
                  color.bg,
                  color.border,
                  isUnread ? "bg-opacity-40" : "bg-opacity-20"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn("font-bold text-sm", color.text)}>
                        {notification.title}
                      </h3>
                      {isUnread && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{notification.message}</p>
                    <p className="text-[10px] text-white/40 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
