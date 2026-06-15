import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { User, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  // Calculate Profile Completion
  let completedFields = 0;
  const totalFields = 4;
  if (profile?.full_name) completedFields++;
  if (profile?.phone) completedFields++;
  if (profile?.department_id) completedFields++;
  if (profile?.organization_id) completedFields++;
  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  const initial = profile?.full_name?.charAt(0) ?? "?";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">My Profile</h1>
      </div>

      <div className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 inset-x-0 h-32 bg-gold/5 blur-3xl -z-10" />
        
        <Avatar className="w-24 h-24 rounded-full border-4 border-gold/20 shadow-xl shadow-gold/10 bg-[#050505] mb-4">
          <AvatarFallback className="bg-transparent text-gold text-3xl font-black italic">
            {initial}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{profile?.full_name ?? "Unnamed Worker"}</h2>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">{user.email}</p>
        
        <div className="w-full mt-8 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-white/40">Profile Completion</span>
            <span className="text-gold">{profileCompletion}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2 mb-4">Account Settings</h3>
        
        <div className="glass rounded-[1.5rem] border-white/5 overflow-hidden">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm font-bold text-white/70">Phone Number</span>
              <span className="text-sm font-medium text-white">{profile?.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm font-bold text-white/70">Role</span>
              <span className="text-sm font-medium text-white capitalize">{profile?.user_role}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm font-bold text-white/70">Timezone</span>
              <span className="text-sm font-medium text-white">{profile?.timezone || "UTC"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <form action={signOut}>
          <button type="submit" className="w-full glass rounded-2xl p-5 flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors group text-red-400">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </form>
      </div>

    </div>
  );
}
