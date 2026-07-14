import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/supabase/cached";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ManagerSidebar } from "@/components/layout/ManagerSidebar";
import { TrialBanner } from "@/components/layout/TrialBanner";
import { needsSubscription } from "@/lib/trial";
import { headers } from "next/headers";
import { signOut } from "@/app/actions";
import { LogOut } from "lucide-react";
import { isPlatformAdmin } from "@/lib/admin-config";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { Suspense } from "react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  if (profile?.user_role === "worker") {
    redirect("/home");
  }

  // org_admin can access shared pages (shifts, swaps, analytics, team)
  // but /dashboard should redirect them to /admin/dashboard
  // /admin/* routes are gated separately in app/admin/layout.tsx

  if (profile?.user_role === "super_admin") {
    redirect("/super-admin");
  }

  const org = (profile as any)?.organization ?? null;

  // If no org yet, redirect to onboarding
  if (!profile?.organization_id) {
    redirect("/onboarding/industry");
  }

  // GATING: check current path via x-pathname header (set by middleware)
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || headerList.get("x-url") || "";
  const isSettingsPage = pathname.includes("/settings");

  const expired = needsSubscription(org);
  const wasOnTrial = org?.plan === "trial";

  // If expired and not on settings page, render locked pricing screen
  if (expired && !isSettingsPage) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col relative">
        <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />

        {/* Top bar with sign out */}
        <header className="w-full flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[#FFD700] font-black text-xl tracking-tight">SwapBoard</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors font-bold text-[10px] uppercase tracking-widest border border-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </header>

        {/* Pricing content */}
        <div className="flex-1 flex flex-col items-center px-4 md:px-8 py-12 md:py-16">
          <div className="w-full max-w-5xl space-y-10">
            {/* Headline */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                Access Suspended
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                {wasOnTrial ? "Your free trial has expired" : "Your subscription has expired"}
              </h1>
              <p className="text-white/50 text-base leading-relaxed max-w-xl mx-auto">
                {wasOnTrial
                  ? <>Your 14-day trial for <span className="text-white font-bold">{org?.name}</span> has ended. Choose a plan below to restore access and keep your data.</>
                  : <>Your subscription for <span className="text-white font-bold">{org?.name}</span> has lapsed. Reactivate a plan below to restore full access.</>
                }
              </p>
            </div>

            {/* Pricing cards via BillingSettings */}
            <Suspense fallback={null}>
              <BillingSettings org={org} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col relative">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
        
        <main className="flex-1 px-4 py-8 md:p-10 pb-32 md:pb-10">
          {children}
        </main>
      </div>
    );
  }

  const isAdmin = profile?.user_role === "org_admin";

  return (
    <div className="min-h-screen bg-[#050505] flex relative">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
      
      {isAdmin ? (
        <AdminSidebar org={org} profile={profile as any} />
      ) : (
        <ManagerSidebar org={org} profile={profile as any} />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-transparent">
          <div className="flex items-center justify-end px-6 md:px-12 py-4 md:py-6">
            <ProfileDropdown profile={profile as any} email={user?.email || ''} />
          </div>
        </header>
        <TrialBanner org={org} />
        <main className="flex-1 px-4 py-8 md:p-10 pb-32 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
