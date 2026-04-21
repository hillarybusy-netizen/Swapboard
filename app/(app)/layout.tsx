import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TrialBanner } from "@/components/layout/TrialBanner";
import { needsSubscription } from "@/lib/trial";
import { headers } from "next/headers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single();

  const org = (profile as any)?.organization ?? null;

  // If no org yet, redirect to onboarding
  if (!profile?.organization_id) {
    redirect("/onboarding/industry");
  }

  // GATING: If trial expired, redirect to billing (unless already on settings page)
  const headerList = await headers();
  const fullPath = headerList.get("x-url") || ""; 
  const isSettingsPage = fullPath.includes("/settings") || children?.toString().includes("Settings");
  
  if (needsSubscription(org) && !isSettingsPage) {
    redirect("/settings?tab=billing&reason=expired");
  }

  return (
    <div className="min-h-screen bg-[#050505] flex relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
      
      <Sidebar org={org} profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner org={org} />
        <main className="flex-1 px-4 py-8 md:p-10 pb-32 md:pb-10 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
