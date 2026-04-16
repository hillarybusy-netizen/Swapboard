import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground text-sm">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No team members yet. Invite your team from Settings.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {(members as any[]).map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{member.full_name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.full_name ?? "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.department?.name ?? "No department"}
                      {member.role?.name && ` · ${member.role.name}`}
                    </p>
                  </div>
                  <Badge variant={member.user_role === "admin" || member.user_role === "manager" ? "default" : "secondary"} className="capitalize shrink-0">
                    {member.user_role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Pending Invites</h2>
          <div className="grid gap-2">
            {(pendingInvites as any[]).map((inv) => (
              <Card key={inv.id} className="opacity-70">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">?</div>
                    <div className="flex-1">
                      <p className="text-sm">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">Invite pending</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">{inv.user_role}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
