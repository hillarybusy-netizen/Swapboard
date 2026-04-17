"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import type { Department, Profile } from "@/lib/database.types";

interface Props {
  departments: Department[];
  profiles: Pick<Profile, "id" | "full_name">[];
  orgId: string;
}

export function AddShiftDialog({ departments, profiles, orgId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", department_id: "", assigned_to: "", start_time: "", end_time: "", notes: "",
  });

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Ensure the status is valid for the constraint
      const { error } = await supabase.from("shifts").insert({
        organization_id: orgId,
        title: form.title,
        department_id: form.department_id || null,
        assigned_to: (form.assigned_to && form.assigned_to !== "none") ? form.assigned_to : null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        notes: form.notes || null,
        status: (form.assigned_to && form.assigned_to !== "none") ? "scheduled" : "open",
        created_by: user?.id,
      });
      if (error) throw error;
      toast({ title: "Shift created successfully", className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" });
      setOpen(false);
      setForm({ title: "", department_id: "", assigned_to: "", start_time: "", end_time: "", notes: "" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Failed to create shift", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-gold rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-gold/20 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Add shift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/5 rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
        
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tight text-white mb-1">Create Shift</DialogTitle>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">New Deployment Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 relative">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Shift Title</Label>
            <Input 
              placeholder="e.g. Morning service, Day shift" 
              className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 focus:border-gold/30 transition-all placeholder:text-white/10"
              value={form.title} 
              onChange={(e) => set("title", e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Start Time</Label>
              <Input 
                type="datetime-local" 
                className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 focus:border-gold/30 transition-all [color-scheme:dark]"
                value={form.start_time} 
                onChange={(e) => set("start_time", e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">End Time</Label>
              <Input 
                type="datetime-local" 
                className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 focus:border-gold/30 transition-all [color-scheme:dark]"
                value={form.end_time} 
                onChange={(e) => set("end_time", e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Department</Label>
              <Select value={form.department_id} onValueChange={(v) => set("department_id", v)}>
                <SelectTrigger className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 transition-all">
                  <SelectValue placeholder="Select dept" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/10 rounded-2xl p-1 shadow-2xl">
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="rounded-xl text-xs font-bold py-3 focus:bg-gold/10 focus:text-gold">
                      <div className="flex items-center gap-2 uppercase tracking-widest scale-90 origin-left">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                         {d.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Assignment</Label>
              <Select value={form.assigned_to} onValueChange={(v) => set("assigned_to", v)}>
                <SelectTrigger className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 transition-all">
                  <SelectValue placeholder="Mark as Open" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/10 rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="none" className="rounded-xl text-xs font-bold py-3 text-red-400 focus:bg-red-400/10 focus:text-red-400">
                    <span className="uppercase tracking-widest scale-90 origin-left">Unassigned (Open)</span>
                  </SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="rounded-xl text-xs font-bold py-3 focus:bg-gold/10 focus:text-gold">
                      <span className="uppercase tracking-widest scale-90 origin-left">{p.full_name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Notes (Optional)</Label>
            <Input 
              placeholder="Any special instructions..." 
              className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 transition-all placeholder:text-white/10"
              value={form.notes} 
              onChange={(e) => set("notes", e.target.value)} 
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 -mx-8 px-8 bg-white/[0.01]">
            <Button type="button" variant="ghost" className="text-white/40 hover:text-white rounded-full px-6 font-bold text-xs" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gold rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest flex items-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Deployment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
