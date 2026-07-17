import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyTeamPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  if (!profile?.organization_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Users className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-white/30">
          No Organization
        </p>
        <p className="text-xs text-white/20">You haven&apos;t been added to an organization yet.</p>
      </div>
    );
  }

  const supabase = await createClient();

  let teamQuery = supabase
    .from("profiles")
    .select("*, department:departments(name, color)")
    .eq("organization_id", profile.organization_id)
    .eq("is_active", true);

  // If user belongs to a specific department, show same department members + managers
  if (profile.department_id) {
    teamQuery = teamQuery.or(`department_id.eq.${profile.department_id},user_role.in.(manager)`);
  }

  teamQuery = teamQuery.order("full_name");

  const { data: membersData } = await teamQuery;

  const members = (membersData ?? []) as any[];

  // Separate managers from workers for the worker-facing team view
  const managers = members.filter((m) => m.user_role === "manager");
  const workers = members.filter((m) => m.user_role !== "manager");

  function MemberCard({ member, isManager = false }: { member: any; isManager?: boolean }) {
    const isMe = member.id === user!.id;
    const initials = getInitials(member.full_name);
    const avatarColor = isManager ? "bg-gold/20 border-gold/30 text-gold" : "bg-white/5 border-white/10 text-white/50";

    return (
      <div
        className={cn(
          "glass rounded-2xl p-4 border relative overflow-hidden group hover:border-white/15 transition-all duration-300",
          isManager ? "border-gold/15 bg-gold/3" : "border-white/5",
          isMe && "border-blue-500/20 bg-blue-500/3"
        )}
      >
        {isManager && (
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold/8 blur-2xl rounded-full pointer-events-none" />
        )}

        <div className="flex items-center gap-3 relative z-10">
          {/* Avatar */}
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-base font-black border-2 shrink-0 transition-transform group-hover:scale-105",
              isManager
                ? "bg-gold/20 border-gold/30 text-gold"
                : "bg-white/5 border-white/10 text-white/50"
            )}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white truncate">
                {member.full_name ?? "Unknown"}
              </h3>
              {isMe && (
                <span className="text-[8px] font-black text-blue-300 bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {member.department?.name && (
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: member.department.color || "#d4af37" }}
                  />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    {member.department.name}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Role badge */}
          {isManager && (
            <div className="shrink-0">
              <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest rounded-full border border-gold/20 bg-gold/10 px-2 py-1">
                Manager
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">My Team</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Staff Directory ·{" "}
          <span className="text-gold/50">{members.length} Members</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center border border-white/5">
          <span className="text-2xl font-black text-white block">{members.length}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Total</span>
        </div>
        <div className="glass rounded-2xl p-4 text-center border border-gold/15">
          <span className="text-2xl font-black text-gold block">{managers.length}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Managers</span>
        </div>
        <div className="glass rounded-2xl p-4 text-center border border-white/5">
          <span className="text-2xl font-black text-blue-400 block">{workers.length}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Workers</span>
        </div>
      </div>

      {/* Managers Section */}
      {managers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Users className="w-3.5 h-3.5 text-gold/60" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/50">
              Managers
            </h2>
          </div>
          <div className="grid gap-3">
            {managers.map((member) => (
              <MemberCard key={member.id} member={member} isManager />
            ))}
          </div>
        </section>
      )}

      {/* Workers Section */}
      {workers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Users className="w-3.5 h-3.5 text-white/30" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Team Members
            </h2>
          </div>
          <div className="grid gap-3">
            {workers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <Users className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-sm font-bold text-white/30">No team members yet</p>
          <p className="text-[11px] text-white/20 mt-1">
            Your team members will appear here once they&apos;re onboarded.
          </p>
        </div>
      )}
    </div>
  );
}
