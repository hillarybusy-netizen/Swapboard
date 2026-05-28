"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createShift } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

interface PostShiftDialogProps {
  organizationId: string;
  departments: any[];
  profiles: any[];
}

export function PostShiftDialog({ organizationId, departments, profiles }: PostShiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department_id: "",
    assigned_to: "",
    start_time: "",
    end_time: "",
    status: "scheduled",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.assigned_to === "unassigned" || !payload.assigned_to) {
        delete payload.assigned_to;
      }
      
      await createShift({
        ...(payload as any),
        organization_id: organizationId,
      });
      toast({ title: "Shift posted successfully!" });
      setOpen(false);
      setFormData({
        title: "",
        department_id: "",
        assigned_to: "",
        start_time: "",
        end_time: "",
        status: "scheduled",
        notes: "",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-gold rounded-full text-xs font-bold uppercase tracking-widest px-6 h-10 shadow-lg shadow-gold/20">
          <Plus className="w-4 h-4 mr-2" />
          Post Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-white/5 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Post New Shift</DialogTitle>
          <DialogDescription className="text-white/40 text-xs font-medium">
            Fill in the details to add a new shift to the schedule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-white/30">Shift Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Morning Server" 
              className="bg-white/5 border-white/10 rounded-xl"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Department</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, department_id: v })} required>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#050505] border-white/10">
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Assign To</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue placeholder="Open Shift" />
                </SelectTrigger>
                <SelectContent className="bg-[#050505] border-white/10">
                  <SelectItem value="unassigned">Open Shift</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Start Time</Label>
              <Input 
                type="datetime-local" 
                className="bg-white/5 border-white/10 rounded-xl [color-scheme:dark]"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">End Time</Label>
              <Input 
                type="datetime-local" 
                className="bg-white/5 border-white/10 rounded-xl [color-scheme:dark]"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Notes</Label>
            <Input 
              placeholder="Optional notes..." 
              className="bg-white/5 border-white/10 rounded-xl"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full btn-gold rounded-full uppercase font-black text-xs h-12" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Post Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
