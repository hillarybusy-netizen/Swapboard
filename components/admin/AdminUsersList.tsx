"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Filter, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { UserActions } from "@/app/super-admin/users/UserActions";

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  super_admin: { label: "Super Admin", className: "bg-gold/20 text-gold border-gold/40 shadow-sm shadow-gold/20" },
  org_admin: { label: "Admin", className: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  manager: { label: "Manager", className: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  worker: { label: "Worker", className: "bg-white/5 text-white/50 border-white/10" },
};

export function AdminUsersList({ users }: { users: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const roles = ["all", "super_admin", "org_admin", "manager", "worker"];

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.full_name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.organization?.name?.toLowerCase().includes(q);

      const matchesRole = selectedRole === "all" || user.user_role === selectedRole;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && user.is_active) ||
        (selectedStatus === "disabled" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or organization..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs md:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Role:
            </span>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  selectedRole === role
                    ? "bg-gold text-black shadow-lg shadow-gold/20"
                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                {role.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={() => setSelectedStatus(selectedStatus === "active" ? "all" : "active")}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedStatus === "active"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/5 text-white/40 hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === "disabled" ? "all" : "disabled")}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedStatus === "disabled"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-white/5 text-white/40 hover:text-white"
              }`}
            >
              Disabled
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-[2rem] overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Organization</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Platform Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-xs text-white/40">
                    No users found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((user: any) => {
                  const roleBadge = ROLE_BADGES[user.user_role] || { label: user.user_role, className: "bg-white/5 text-white/40 border-white/10" };

                  return (
                    <tr key={user.id} className="group hover:bg-white/[0.015] transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-white/10 shadow-md group-hover:border-gold/30 transition-all shrink-0">
                            <AvatarFallback className="bg-white/5 text-white/60 text-xs font-bold">
                              {user.full_name?.charAt(0) ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-white tracking-tight group-hover:text-gold transition-colors">
                              {user.full_name || "Anonymous User"}
                            </p>
                            <p className="text-[10px] text-white/30 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="px-6 py-4">
                        {user.organization ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-white/20 shrink-0" />
                            <span className="text-xs font-semibold text-white/70">{user.organization.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/20 italic">No Organization (Platform)</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <Badge className={`rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider border ${roleBadge.className}`}>
                          {roleBadge.label}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Disabled
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <UserActions user={user} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
