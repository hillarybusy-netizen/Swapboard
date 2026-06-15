import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw, Home, CalendarDays, Users, User, Bell } from "lucide-react";
import { WorkerLogoutButton } from "@/components/layout/WorkerLogoutButton";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#050505] relative pb-24">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 pt-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
              <RefreshCw className="w-5 h-5 text-[#050505] -scale-x-100" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Swap<span className="text-gold">Board</span></span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Bell className="w-6 h-6 text-white/70" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050505]" />
            </div>
            <div className="w-10 h-10 rounded-full border border-gold text-gold flex items-center justify-center font-bold text-lg">
              {initial}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 pt-28 pb-10">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="max-w-lg mx-auto px-6 h-20 flex items-center justify-between relative">
          <Link href="/my-shifts" className="flex flex-col items-center gap-1.5 text-gold">
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          
          <Link href="/my-shifts" className="flex flex-col items-center gap-1.5 text-white/40">
            <CalendarDays className="w-6 h-6" />
            <span className="text-[10px] font-bold">Shifts</span>
          </Link>

          {/* Center Swap Button */}
          <div className="relative -top-6 flex flex-col items-center">
            <Link href="/swap-requests" className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-transform">
              <RefreshCw className="w-8 h-8 text-[#050505]" />
            </Link>
            <span className="text-[10px] font-bold text-white/40 mt-1">Swap</span>
          </div>

          <Link href="/team" className="flex flex-col items-center gap-1.5 text-white/40">
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">Team</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center gap-1.5 text-white/40">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
