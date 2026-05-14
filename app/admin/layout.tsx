import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/admin-config";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = await isPlatformAdmin(user.email);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050505] flex relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
      
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#eeeeee]/60 mt-0.5">Platform Status: Online</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-[#eeeeee]/40 mt-0.5">Logged in as {user.email}</span>
          </div>
        </header>
        <main className="flex-1 px-10 py-12 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
