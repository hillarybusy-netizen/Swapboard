import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminProfileDropdown } from "@/components/layout/AdminProfileDropdown";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only super_admin users can access the platform admin dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050505] flex relative">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
      
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#eeeeee]/60 mt-0.5">Platform Status: Online</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#eeeeee]/40 mt-0.5 hidden sm:inline">Logged in as {user.email}</span>
            <AdminProfileDropdown email={user.email || ""} />
          </div>
        </header>
        <main className="flex-1 px-10 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
