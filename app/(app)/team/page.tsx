import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const { data: membersData } = await supabase
    .from("profiles")
    .select("*, department:departments(*), role:roles(*)")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("full_name");

  const { data: pendingInvitesData } = await supabase
    .from("invitations")
    .select("*")
    .eq("organization_id", orgId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  const members = (membersData ?? []) as any[];
  const pendingInvites = (pendingInvitesData ?? []) as any[];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Team Directory</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Staff Overview · <span className="text-gold/60">{members.length} Active Members</span>
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="px-2">
          <div className="glass rounded-[2.5rem] p-20 text-center border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Users className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest tracking-tighter">Alone for Now</h3>
            <p className="text-sm text-white/30 font-medium max-w-xs mx-auto">Invite your team members from Settings to start collaborating.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 px-2">
          {(members as any[]).map((member) => (
            <div key={member.id} className="glass rounded-[2rem] p-6 border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl -z-10" />
              <div className="flex items-center gap-6">
                <Avatar className="w-14 h-14 rounded-full border-2 border-white/5 ring-4 ring-white/[0.02]">
                  <AvatarFallback className="bg-white/5 text-white/40 text-lg font-black italic">
                    {member.full_name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black tracking-tight text-white mb-1">{member.full_name ?? "Unknown"}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                    {member.department?.name && (
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.department.color }} />
                        {member.department.name}
                      </span>
                    )}
                    {member.role?.name && (
                      <>
                        <span>·</span>
                        <span className="text-gold/40">{member.role.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <Badge className={cn(
                  "rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-none shrink-0",
                  member.user_role === "admin" || member.user_role === "manager" ? "bg-gold text-[#050505]" : "bg-white/10 text-white/40"
                )}>
                  {member.user_role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="px-2 pt-10 border-t border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Pending Invitations</h2>
          <div className="grid gap-4">
            {(pendingInvites as any[]).map((inv) => (
              <div key={inv.id} className="glass rounded-[1.5rem] p-5 border-white/5 border-dashed opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-xs font-black">?</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white/80">{inv.email}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Awaiting Acceptance</p>
                  </div>
                  <Badge className="bg-white/5 text-white/40 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none">
                    {inv.user_role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
