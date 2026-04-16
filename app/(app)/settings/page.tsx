import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgSettings } from "@/components/settings/OrgSettings";
import { DepartmentEditor } from "@/components/settings/DepartmentEditor";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { InviteTeam } from "@/components/settings/InviteTeam";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*, organization:organizations(*)").eq("id", user.id).single();
  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const org = (profile as any)?.organization;

  const { data: departmentsData } = await supabase
    .from("departments")
    .select("*, roles(*)")
    .eq("organization_id", orgId)
    .order("sort_order");

  const departments = (departmentsData ?? []) as any[];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your organization</p>
      </div>

      <Tabs defaultValue={searchParams.tab ?? "org"}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="team">Invite Team</TabsTrigger>
          <TabsTrigger value="billing">Trial & Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-6">
          <OrgSettings org={org} userId={user.id} />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentEditor departments={departments as any} orgId={orgId} />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <InviteTeam orgId={orgId} departments={departments as any} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingSettings org={org} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
