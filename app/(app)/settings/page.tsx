import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgSettings } from "@/components/settings/OrgSettings";
import { DepartmentEditor } from "@/components/settings/DepartmentEditor";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { InviteTeam } from "@/components/settings/InviteTeam";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";

export default async function SettingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
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

  const { count: profileCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="px-1 md:px-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Configuration</h1>
        <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Manage your organization settings and preferences</p>
      </div>

      <Tabs defaultValue={searchParams.tab ?? "org"} className="px-1 md:px-2">
        <TabsList className="bg-white/5 p-1 rounded-full border border-white/5 h-11 md:h-12 flex gap-1 w-full md:w-fit mb-8 md:mb-10 overflow-x-auto no-scrollbar">
          {[
            { value: "org", label: "Organization" },
            { value: "departments", label: "Departments" },
            { value: "team", label: "Invite Team" },
            { value: "billing", label: "Trial & Billing" },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="rounded-full px-4 md:px-6 data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 transition-all h-full whitespace-nowrap flex-1 md:flex-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -z-10" />
          
          <TabsContent value="org" className="mt-0 outline-none">
            <OrgSettings org={org} userId={user.id} />
          </TabsContent>

          <TabsContent value="departments" className="mt-0 outline-none">
            <DepartmentEditor departments={departments as any} orgId={orgId} org={org} />
          </TabsContent>

          <TabsContent value="team" className="mt-0 outline-none">
            <InviteTeam orgId={orgId} departments={departments as any} org={org} profileCount={profileCount || 0} />
          </TabsContent>

          <TabsContent value="billing" className="mt-0 outline-none">
            <BillingSettings org={org} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
