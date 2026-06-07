"use client";

import { AdminSearch } from "./AdminSearch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { UserActions } from "@/app/admin/users/UserActions";

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function AdminUsersList({ users }: { users: any[] }) {
  return (
    <AdminSearch
      placeholder="Search users or organizations..."
      items={users}
      filterFn={(user, q) =>
        (user.full_name?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q) ||
          user.organization?.name?.toLowerCase().includes(q)) ?? false
      }
    >
      {(filtered) => (
        <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">User</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Organization</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filtered.map((user: any) => (
                  <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border border-white/5 shadow-lg group-hover:border-gold/20 transition-all">
                          <AvatarFallback className="bg-white/5 text-white/40 text-xs font-black italic">
                            {user.full_name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight">{user.full_name ?? "Anonymous"}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/5 text-white/20">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{user.organization?.name ?? "No Org"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest border-none",
                        user.user_role === "admin" ? "bg-gold text-[#050505]" : "bg-white/5 text-white/40"
                      )}>
                        {user.user_role}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      {user.is_active ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-green-500/80">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Disabled</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <UserActions user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminSearch>
  );
}
