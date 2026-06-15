import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MyTeamPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const orgId = profile?.organization_id;

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Users className="w-12 h-12 mb-4 text-white/20" />
        <p className="text-sm font-bold uppercase tracking-widest text-white/50">No Organization</p>
      </div>
    );
  }

  const { data: membersData } = await supabase
    .from("profiles")
    .select("*, department:departments(*), role:roles(*)")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("full_name");

  const members = (membersData ?? []) as any[];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">My Team</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Staff Directory · <span className="text-gold/60">{members.length} Members</span>
        </p>
      </div>

      <div className="grid gap-3">
        {members.map((member) => (
          <div key={member.id} className="glass rounded-[1.5rem] p-5 border-white/5 relative overflow-hidden flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-full border-2 border-white/5 shrink-0 bg-[#050505]">
              <AvatarFallback className="bg-white/5 text-white/40 text-sm font-black italic">
                {member.full_name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate leading-tight">
                {member.full_name ?? "Unknown"}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-white/30 flex-wrap">
                {member.department?.name && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.department.color || "#FFD700" }} />
                    {member.department.name}
                  </span>
                )}
                {member.role?.name && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-gold/40">{member.role.name}</span>
                  </>
                )}
              </div>
            </div>

            {member.user_role === "manager" || member.user_role === "admin" ? (
              <Badge className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest bg-gold text-[#050505] shrink-0 border-none">
                Manager
              </Badge>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
