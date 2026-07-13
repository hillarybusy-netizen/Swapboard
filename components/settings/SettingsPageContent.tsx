import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { needsSubscription } from "@/lib/trial";
import { AlertTriangle, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";

export async function SettingsPageContent({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const org = (profile as any)?.organization;
  const expired = needsSubscription(org);
  const wasOnTrial = org?.plan === "trial";
  const isManager = profile?.user_role === "manager";
  const activeTab = isManager
    ? "account"
    : expired
    ? "billing"
    : (searchParams.tab ?? "org");

  const supabase = await createClient();

  const [departmentsRes, profileCountRes, pendingInvitesRes] = await Promise.all([
    supabase
      .from("departments")
      // Settings only needs the department records. Avoid depending on the
      // optional roles relationship, which can make the whole query fail when
      // that relationship is unavailable in an existing database.
      .select("id, organization_id, name, color, sort_order")
      .eq("organization_id", orgId)
      .order("sort_order"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("invitations")
      .select("id, email, user_role, created_at")
      .eq("organization_id", orgId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const departments = (departmentsRes.data ?? []) as any[];
  const profileCount = profileCountRes.count;
  const pendingInvites = pendingInvitesRes.data ?? [];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="px-1 md:px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Settings</h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
            Manage your organization, account, team, and billing
          </p>
        </div>
        {expired && (
          <form action={signOut} className="self-end md:self-auto">
            <button
              type="submit"
              className="flex items-center gap-2 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors font-bold text-[10px] uppercase tracking-widest border border-white/5"
            >
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
            <h3 className="text-white font-bold text-lg">
              {wasOnTrial ? "Your Free Trial Has Expired" : "Your Subscription Has Expired"}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
              {wasOnTrial
                ? "Your 14-day trial has ended. Choose a subscription plan below to restore full access."
                : "Your subscription has lapsed. Reactivate a plan below to restore full access."}
            </p>
          </div>
        </div>
      )}

      <SettingsTabs
        defaultTab={activeTab}
        expired={expired}
        org={org}
        userId={user.id}
        userEmail={user.email}
        profile={profile!}
        departments={departments}
        orgId={orgId}
        profileCount={profileCount || 0}
        pendingInvites={pendingInvites}
        isManager={isManager}
      />

      {!expired && (
        <div className="flex justify-end px-1 md:px-2 pt-4">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors font-bold text-[10px] uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
