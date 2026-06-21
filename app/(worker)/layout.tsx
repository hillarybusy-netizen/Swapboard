import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { WorkerSidebar } from "@/components/layout/WorkerSidebar";
import { RealtimeNotifications } from "@/components/layout/RealtimeNotifications";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.user_role !== "worker") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <RealtimeNotifications userId={user.id} departmentId={profile?.department_id} />
      {/* Desktop Sidebar */}
      <WorkerSidebar profile={profile} />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col max-w-full overflow-hidden">
        {/* Mesh background for the main area */}
        <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />

        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
          <AnimatedLogo size="sm" showText={false} />
          <ProfileDropdown profile={profile} />
        </div>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 md:py-12 pb-24 md:pb-12 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <WorkerBottomNav />
        </div>
      </div>
    </div>
  );
}
