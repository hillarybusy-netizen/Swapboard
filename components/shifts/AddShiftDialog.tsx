"use client";
import { catchError } from "@/lib/errors";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createShift } from "@/app/actions/shift";
import { toast } from "@/hooks/use-toast";
import { Plus, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectUserTimezone, COMMON_TIMEZONES } from "@/lib/timezone";
import type { Department, Profile } from "@/lib/database.types";

interface Props {
  departments: Department[];
  profiles: Pick<Profile, "id" | "full_name" | "department_id">[];
  orgId: string;
}

export function AddShiftDialog({ departments, profiles, orgId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [form, setForm] = useState({
    title: "", department_id: "", assigned_to: "", start_time: "", end_time: "", notes: "",
  });

  // Detect timezone on mount
  useEffect(() => {
    setUserTimezone(detectUserTimezone());
  }, []);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })) }

  const selectedDept = departments.find(d => d.id === form.department_id);
  const isGeneralDept = form.department_id === "general" || selectedDept?.name?.toLowerCase() === "general";

  const filteredProfiles = form.department_id
    ? isGeneralDept
      ? [] // General department only allows open shifts
      : profiles.filter(p => p.department_id === form.department_id)
    : profiles;

  // Convert local time to UTC for submission
  function localToUTC(localDateTime: string): string {
    if (!localDateTime) return "";
    const local = new Date(localDateTime);
    const utc = new Date(local.getTime() - local.getTimezoneOffset() * 60000);
    return utc.toISOString();
  }

  function isPastDateTime(localDateTime: string): boolean {
    if (!localDateTime) return false;
    const selectedDateTime = new Date(localDateTime);
    const now = new Date();
    return selectedDateTime < now;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time || !form.department_id) return;

    if (isPastDateTime(form.start_time)) {
      toast({ title: "Cannot create shift in the past", variant: "destructive" });
      return;
    }
    if (isPastDateTime(form.end_time)) {
      toast({ title: "End time cannot be in the past", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await createShift({
        organization_id: orgId,
        title: form.title,
        department_id: form.department_id === "general" ? null : form.department_id || null,
        assigned_to: (form.assigned_to && form.assigned_to !== "none") ? form.assigned_to : null,
        start_time: localToUTC(form.start_time),
        end_time: localToUTC(form.end_time),
        notes: form.notes || null,
      });
      toast({ title: "Shift created successfully", className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" });
      setOpen(false);
      setForm({ title: "", department_id: "", assigned_to: "", start_time: "", end_time: "", notes: "" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Failed to create shift", description: catchError(err), variant: "destructive" });
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
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
            <Globe className="w-3.5 h-3.5 text-gold" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Timezone: {userTimezone} • 24 Hour Clock</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 relative">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Shift Title <span className="text-red-400">*</span></Label>
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Start Time <span className="text-red-400">*</span></Label>
              <Input
                type="datetime-local"
                className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 focus:border-gold/30 transition-all [color-scheme:dark]"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">End Time <span className="text-red-400">*</span></Label>
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Department <span className="text-red-400">*</span></Label>
              <Select value={form.department_id} onValueChange={(v) => set("department_id", v)}>
                <SelectTrigger className="glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 transition-all">
                  <SelectValue placeholder="- select -" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/10 rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="general" className="rounded-xl text-xs font-bold py-3 focus:bg-gold/10 focus:text-gold">
                    <span className="uppercase tracking-widest">General</span>
                  </SelectItem>
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
              <Select
                value={form.assigned_to}
                onValueChange={(v) => set("assigned_to", v)}
                disabled={isGeneralDept}
              >
                <SelectTrigger className={cn(
                  "glass border-white/5 rounded-2xl h-12 px-5 text-sm font-medium focus:ring-gold/30 transition-all",
                  isGeneralDept && "opacity-50 cursor-not-allowed"
                )}>
                  <SelectValue placeholder={isGeneralDept ? "Only Open Shifts" : "- select -"} />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/10 rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="none" className="rounded-xl text-xs font-bold py-3 text-red-400 focus:bg-red-400/10 focus:text-red-400">
                    <span className="uppercase tracking-widest scale-90 origin-left">
                      Unassigned ({isGeneralDept ? "General" : form.department_id ? "Dept" : "All"})
                    </span>
                  </SelectItem>
                  {!form.department_id && (
                    <div className="px-3 py-2 text-[10px] text-white/30">Select a department first</div>
                  )}
                  {isGeneralDept && (
                    <div className="px-3 py-2 text-[10px] text-white/50 font-medium italic">
                      General department allows only open shifts
                    </div>
                  )}
                  {!isGeneralDept && filteredProfiles.map((p) => (
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
