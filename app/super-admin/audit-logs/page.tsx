import { getPlatformAuditLogs } from "@/lib/actions/admin";
import { AdminAuditLogClient } from "@/components/admin/AdminAuditLogClient";
import { History, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminAuditLogsPage() {
  const logs = await getPlatformAuditLogs(150);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security & Compliance
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Platform Audit Log</h1>
          <p className="text-white/40 text-xs md:text-sm mt-1">
            Real-time immutable ledger of operational events, shift activity, and security changes across Swapboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Streaming Live</span>
          </div>
        </div>
      </div>

      <AdminAuditLogClient logs={logs as any} />
    </div>
  );
}
