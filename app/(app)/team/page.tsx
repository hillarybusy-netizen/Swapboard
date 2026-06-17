import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InviteTeam } from "@/components/settings/InviteTeam";
import { RevokeInviteButton } from "@/components/team/RevokeInviteButton";
import { EditMemberDialog } from "@/components/team/EditMemberDialog";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single();

  const orgId = profile?.organization_id;
  const org = (profile as any)?.organization;
  if (!orgId || !org) redirect("/onboarding/industry");

  const [
    { data: membersData },
    { data: pendingInvitesData },
    { data: departmentsData }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, department:departments(*), role:roles(*)")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("invitations")
      .select("*")
      .eq("organization_id", orgId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("departments")
      .select("*")
      .eq("organization_id", orgId)
      .order("name")
  ]);

  const members = (membersData ?? []) as any[];
  const pendingInvites = (pendingInvitesData ?? []) as any[];
  const departments = (departmentsData ?? []) as any[];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Team Directory</h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
            Staff Overview · <span className="text-gold/60">{members.length} Active Members</span>
          </p>
        </div>
      </div>

      {/* Add Team Section */}
      <div className="px-1 md:px-2">
        <InviteTeam 
          orgId={orgId} 
          departments={departments} 
          org={org} 
          profileCount={members.length + pendingInvites.length} 
        />
      </div>

      <div className="px-1 md:px-2 pt-6 border-t border-white/5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Internal Staff</h2>
        {members.length === 0 ? (
          <div className="glass rounded-[2.5rem] p-20 text-center border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Users className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest tracking-tighter">Alone for Now</h3>
            <p className="text-sm text-white/30 font-medium max-w-xs mx-auto">Invite your team members to start collaborating.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {(members as any[]).map((member) => (
              <div key={member.id} className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-white/5 hover:border-white/10 glass-item-transition relative overflow-hidden group scroll-item">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl -z-10" />
                <div className="flex items-center gap-4 md:gap-6">
                  <Avatar className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/5 ring-4 ring-white/[0.02] shrink-0">
                    <AvatarFallback className="bg-white/5 text-white/40 text-base md:text-lg font-black italic">
                      {member.full_name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-black tracking-tight text-white mb-1 truncate">{member.full_name ?? "Unknown"}</h3>
                    <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 flex-wrap">
                      {member.department?.name && (
                        <span className="flex items-center gap-1.5 md:gap-2">
                          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full" style={{ backgroundColor: member.department.color }} />
                          {member.department.name}
                        </span>
                      )}
                      {member.role?.name && (
                        <>
                          <span className="hidden sm:inline">·</span>
                          <span className="text-gold/40">{member.role.name}</span>
                        </>
                      )}
                      {member.member_id && (
                        <>
                          <span>·</span>
                          <span className="text-white/40">{member.member_id}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge className={cn(
                    "rounded-full px-3 md:px-4 py-1 md:py-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest border-none shrink-0",
                    member.user_role === "admin" || member.user_role === "manager" ? "bg-gold text-[#050505]" : "bg-white/10 text-white/40"
                  )}>
                    {member.user_role}
                  </Badge>

                  {profile?.user_role === "admin" && member.user_role !== "admin" && (
                    <EditMemberDialog 
                      memberId={member.id}
                      memberName={member.full_name ?? "Unknown"}
                      memberRole={member.user_role as "worker" | "manager"}
                      currentDeptId={member.department_id}
                      currentDeptIds={member.department_ids}
                      departments={departments}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingInvites.length > 0 && (
        <div className="px-2 pt-10 border-t border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Pending Invitations</h2>
          <div className="grid gap-4">
            {(pendingInvites as any[]).map((inv) => (
              <div key={inv.id} className="glass rounded-[1.5rem] p-5 border-white/5 border-dashed opacity-60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-xs font-black shrink-0">?</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white/80 truncate">{inv.email ?? "Manual Link Invite"}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Awaiting Acceptance</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <Badge className="bg-white/5 text-white/40 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none shrink-0">
                      {inv.user_role}
                    </Badge>
                    <RevokeInviteButton id={inv.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
