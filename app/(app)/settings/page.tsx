import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgSettings } from "@/components/settings/OrgSettings";
import { DepartmentEditor } from "@/components/settings/DepartmentEditor";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { InviteTeam } from "@/components/settings/InviteTeam";
import { needsSubscription } from "@/lib/trial";
import { AlertTriangle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

import { signOut } from "@/app/actions";

export default async function SettingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const org = (profile as any)?.organization;
  const expired = needsSubscription(org);
  const activeTab = expired ? "billing" : (searchParams.tab ?? "org");

  const supabase = await createClient();

  const [departmentsRes, profileCountRes] = await Promise.all([
    supabase
      .from("departments")
      .select("*, roles(*)")
      .eq("organization_id", orgId)
      .order("sort_order"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
  ]);

  const departments = (departmentsRes.data ?? []) as any[];
  const profileCount = profileCountRes.count;

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="px-1 md:px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Configuration</h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Manage your organization settings and preferences</p>
        </div>
        {expired && (
          <form action={signOut} className="self-end md:self-auto">
            <button type="submit" className="flex items-center gap-2 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors font-bold text-[10px] uppercase tracking-widest border border-white/5">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        )}
      </div>

      {expired && (
        <div className="mx-1 md:mx-2 bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl -z-10" />
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-white font-bold text-lg">Your Free Trial Has Expired</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
              Your 14-day trial has ended. Access to other settings and dashboard features is locked. Choose a subscription plan below to restore full access.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue={activeTab} className="px-1 md:px-2">
        <TabsList className="bg-white/5 p-1 rounded-full border border-white/5 h-11 md:h-12 flex gap-1 w-full md:w-fit mb-8 md:mb-10 overflow-x-auto no-scrollbar">
          {[
            { value: "org", label: "Organization" },
            { value: "departments", label: "Departments" },
            { value: "team", label: "Invite Team" },
            { value: "billing", label: "Trial & Billing" },
          ].map((tab) => {
            const isDisabled = expired && tab.value !== "billing";
            return (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                disabled={isDisabled}
                className={cn(
                  "rounded-full px-4 md:px-6 data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 transition-all h-full whitespace-nowrap flex-1 md:flex-none",
                  isDisabled && "opacity-20 cursor-not-allowed pointer-events-none"
                )}
              >
                {tab.label}
              </TabsTrigger>
            );
          })}
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
            <BillingSettings org={org} userEmail={user.email} />
          </TabsContent>
        </div>
      </Tabs>

      {!expired && (
        <div className="flex justify-end px-1 md:px-2 pt-4">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors font-bold text-[10px] uppercase tracking-widest">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
