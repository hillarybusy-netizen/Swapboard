import { getAllUsers, deactivateUser } from "@/lib/actions/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  MoreVertical, 
  UserMinus, 
  UserPlus,
  Building2,
  ShieldAlert
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await getAllUsers();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">User Directory</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Managing <span className="text-gold/60">{users.length} Users</span> across all organizations
          </p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search users or organizations..." 
            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.07] transition-all w-full md:w-80"
          />
        </div>
      </div>

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
              {users.map((user: any) => (
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
    </div>
  );
}

// Client component for interaction
import { UserActions } from "./UserActions";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
