"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ShieldCheck, Clock, Building2, User, Activity, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface AuditLogItem {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: any;
  created_at: string;
  organization?: any;
  actor?: any;
}

function getOrgName(org: any): string {
  if (!org) return "";
  if (Array.isArray(org)) return org[0]?.name || "";
  return org.name || "";
}

function getActor(actor: any): { full_name?: string | null; email?: string | null; user_role?: string } | null {
  if (!actor) return null;
  if (Array.isArray(actor)) return actor[0] || null;
  return actor;
}

export function AdminAuditLogClient({ logs }: { logs: AuditLogItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const entityTypes = useMemo(() => {
    const types = new Set<string>();
    logs.forEach((log) => {
      if (log.entity_type) types.add(log.entity_type);
    });
    return ["all", ...Array.from(types)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const orgName = getOrgName(log.organization);
      const actor = getActor(log.actor);

      const matchesSearch =
        !q ||
        log.action?.toLowerCase().includes(q) ||
        log.entity_type?.toLowerCase().includes(q) ||
        orgName.toLowerCase().includes(q) ||
        actor?.full_name?.toLowerCase().includes(q) ||
        actor?.email?.toLowerCase().includes(q);

      const matchesEntity = selectedEntity === "all" || log.entity_type === selectedEntity;

      return matchesSearch && matchesEntity;
    });
  }, [logs, searchQuery, selectedEntity]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor, organization..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs md:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Entity:
          </span>
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEntity(type)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                selectedEntity === type
                  ? "bg-gold text-black shadow-lg shadow-gold/20"
                  : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mx-auto">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white/60">No platform audit records found</p>
            <p className="text-xs text-white/30 max-w-xs mx-auto">
              Audit records are automatically created as team members create shifts, swap shifts, and manage organization settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Action & Entity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Actor</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Organization</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/[0.015] transition-colors">
                    {/* Action & Entity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-black shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{log.action}</span>
                            <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              {log.entity_type}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-mono text-white/20 truncate max-w-[200px]">ID: {log.entity_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-6 py-4">
                      {(() => {
                        const actor = getActor(log.actor);
                        return actor ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">
                              {actor.full_name?.charAt(0) ?? "U"}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white truncate">{actor.full_name || "User"}</p>
                              <p className="text-[9px] text-white/30">{actor.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-white/20 italic">System / Anonymous</span>
                        );
                      })()}
                    </td>

                    {/* Organization */}
                    <td className="px-6 py-4">
                      {(() => {
                        const orgName = getOrgName(log.organization);
                        return orgName ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
                            <Building2 className="w-3.5 h-3.5 text-white/20" />
                            <span>{orgName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/20">Platform-wide</span>
                        );
                      })()}
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
                        <Clock className="w-3 h-3 text-white/20" />
                        <span>{new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </td>

                    {/* Detail button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold/10 hover:text-gold border border-white/5 hover:border-gold/20 text-[10px] font-black uppercase tracking-widest text-white/40 transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Metadata Detail Dialog */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="glass border-white/10 bg-[#080808]/95 max-w-lg text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              Audit Event Payload
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Action</p>
                  <p className="font-bold text-white mt-0.5">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Entity Type</p>
                  <p className="font-bold text-white mt-0.5">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Organization</p>
                  <p className="font-bold text-white mt-0.5">{getOrgName(selectedLog.organization) || "Global"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Timestamp</p>
                  <p className="font-bold text-white mt-0.5">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Metadata JSON</p>
                <pre className="p-4 rounded-2xl bg-black/60 border border-white/5 text-[11px] font-mono text-gold/80 overflow-x-auto max-h-60 no-scrollbar">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
