"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, X, CheckCircle2, Loader2, ChevronRight } from "lucide-react";

interface Invite { email: string; role: "manager" | "worker" }

export default function InvitePage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "worker" }]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function addRow() { setInvites((i) => [...i, { email: "", role: "worker" }]) }
  function removeRow(i: number) { setInvites((v) => v.filter((_, idx) => idx !== i)) }
  function updateEmail(i: number, email: string) { setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, email } : inv)) }
  function updateRole(i: number, role: "manager" | "worker") { setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, role } : inv)) }

  async function handleSendInvites() {
    const valid = invites.filter((i) => i.email.trim());
    if (valid.length === 0) { goToDashboard(); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user!.id).single();
      if (!profile?.organization_id) throw new Error("No organization found");

      for (const inv of valid) {
        await supabase.from("invitations").insert({
          organization_id: profile.organization_id,
          email: inv.email.trim(),
          user_role: inv.role,
          invited_by: user!.id,
        });
      }
      setDone(true);
    } catch (err: any) {
      toast({ title: "Failed to send invites", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function goToDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user!.id);
    router.push("/dashboard");
    router.refresh();
  }

  if (done) {
    return (
      <div className="text-center py-24 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8 border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <CheckCircle2 className="w-12 h-12 text-gold animate-in zoom-in slide-in-from-top-1 duration-1000 delay-300" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Transmission Successful</h1>
        <p className="text-white/40 text-sm font-medium mb-12 max-w-sm mx-auto">Your team invitations have been dispatched. They can join the workspace immediately.</p>
        <Button className="h-14 px-12 btn-gold rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-gold/20" onClick={goToDashboard}>
          Enter Workspace <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-12 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <span className="text-gold">Step 03</span>
        <span className="opacity-50">/</span>
        <span>Personnel Enrollment</span>
      </div>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
          Invite <br />
          <span className="text-gold-gradient">Your Core Team</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-lg">
          Onboard your initial staff to begin coordinating shifts. You can always manage invitations later in the Command Center.
        </p>
      </div>

      <div className="glass rounded-[2rem] border-white/5 p-8 space-y-6">
        <div className="grid grid-cols-[1fr_160px_48px] gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-4">
          <span>Email address</span>
          <span>Access Level</span>
          <span />
        </div>
        
        <div className="space-y-3">
          {invites.map((inv, i) => (
            <div key={i} className="grid grid-cols-[1fr_160px_48px] gap-4 items-center">
              <Input 
                type="email" 
                placeholder="colleague@company.com" 
                value={inv.email} 
                onChange={(e) => updateEmail(i, e.target.value)} 
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 text-white placeholder:text-white/10"
              />
              <Select value={inv.role} onValueChange={(v) => updateRole(i, v as any)}>
                <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold focus:ring-gold/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-white/10 text-white">
                  <SelectItem value="worker" className="focus:bg-gold focus:text-[#050505] font-bold">Worker Access</SelectItem>
                  <SelectItem value="manager" className="focus:bg-gold focus:text-[#050505] font-bold">Manager Access</SelectItem>
                </SelectContent>
              </Select>
              <button onClick={() => removeRow(i)} disabled={invites.length === 1} className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-red-500 disabled:opacity-30 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={addRow} className="text-gold hover:text-gold hover:bg-gold/10 font-bold text-[10px] uppercase tracking-widest mt-4">
          <Plus className="w-3 h-3 mr-2" /> Add Personnel
        </Button>
      </div>

      <div className="flex justify-between items-center mt-16 pt-12 border-t border-white/5">
        <Button variant="ghost" onClick={goToDashboard} className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest">
          Provision Later
        </Button>
        <Button className="h-14 px-8 btn-gold rounded-full text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-gold/20 disabled:opacity-20" onClick={handleSendInvites} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Finalize & Deploy <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <Link href="/dashboard" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
