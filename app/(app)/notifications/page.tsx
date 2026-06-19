import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Notifications</h1>
        <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-wide uppercase">
          Manage and review all your SwapBoard notifications
        </p>
      </div>

      {/* Notification Center */}
      <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
        <NotificationCenter />
      </div>
    </div>
  );
}
