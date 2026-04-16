import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TrialBanner } from "@/components/layout/TrialBanner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single();

  // If no org yet, redirect to onboarding
  if (!profile?.organization_id) {
    redirect("/onboarding/industry");
  }

  const org = (profile as any)?.organization ?? null;

  return (
    <div className="min-h-screen flex">
      <Sidebar org={org} profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner org={org} />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
