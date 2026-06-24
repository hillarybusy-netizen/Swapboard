import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/supabase/cached";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TrialBanner } from "@/components/layout/TrialBanner";
import { needsSubscription } from "@/lib/trial";
import { headers } from "next/headers";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { AlertTriangle, LogOut, ArrowRight } from "lucide-react";
import { isPlatformAdmin } from "@/lib/admin-config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  if (profile?.user_role === "worker") {
    redirect("/my-shifts");
  }

  if (profile?.user_role === "admin") {
    const isAdmin = await isPlatformAdmin(user.email);
    if (isAdmin) {
      redirect("/admin");
    }
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

  // If trial expired and not on settings page, render locked screen (not redirect)
  if (expired && !isSettingsPage) {
    return (
      <div className="min-h-screen bg-[#050505] flex relative">
        <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
        <div className="flex-1 flex flex-col min-w-0 items-center justify-center px-6 py-12">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Your free trial has expired
              </h1>
              <p className="text-white/50 text-base leading-relaxed">
                Your 14-day trial for <span className="text-white font-bold">{org?.name}</span> has ended. Choose a plan to keep your data and continue using SwapBoard.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4">
              <Link
                href="/settings?tab=billing"
                className="inline-flex items-center justify-center gap-2 bg-[#FFD700] text-[#050505] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Choose a Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 text-white/30 hover:text-red-400 transition-colors text-sm font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out instead
                </button>
              </form>
            </div>

            {/* Plan badges */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { name: "Starter", price: "$79/mo" },
                { name: "Growth", price: "$199/mo", highlight: true },
                { name: "Enterprise", price: "$499/mo" },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-4 text-center border ${plan.highlight
                    ? "border-[#FFD700]/40 bg-[#FFD700]/5"
                    : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-widest mb-1 ${plan.highlight ? "text-[#FFD700]" : "text-white/40"}`}>
                    {plan.name}
                  </p>
                  <p className="text-white font-bold text-sm">{plan.price}</p>
                </div>
              ))}
            </div>
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

  return (
    <div className="min-h-screen bg-[#050505] flex relative">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
      
      <Sidebar org={org} profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner org={org} />
        <main className="flex-1 px-4 py-8 md:p-10 pb-32 md:pb-10">
          {children}
        </main>
      </div>
      <MobileNav profile={profile} org={org} />
    </div>
  );
}
