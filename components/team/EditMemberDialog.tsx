"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateMemberDepartments } from "@/lib/actions/profile";
import { toast } from "@/hooks/use-toast";
import { Loader2, Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Props {
  memberId: string;
  memberName: string;
  memberRole: "worker" | "manager" | "admin";
  currentDeptId?: string | null;
  currentDeptIds?: string[] | null;
  currentManagerType?: "general" | "department" | null;
  departments: Department[];
}

export function EditMemberDialog({ memberId, memberName, memberRole, currentDeptId, currentDeptIds, currentManagerType, departments }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(currentDeptId ?? null);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(currentDeptIds ?? []);
  const [managerType, setManagerType] = useState<"general" | "department">(currentManagerType ?? "general");

  const handleToggleDept = (deptId: string) => {
    if (memberRole === "worker") {
      setSelectedDeptId(deptId);
    } else if (memberRole === "manager") {
      setSelectedDeptIds(prev => 
        prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
      );
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const deptId = memberRole === "manager" && managerType === "department" ? selectedDeptId : null;
      await updateMemberDepartments(
        memberId,
        deptId,
        selectedDeptIds,
        memberRole === "manager" ? managerType : undefined
      );
      toast({
        title: "Saved",
        description: `${memberName}'s department assignments updated.`,
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors">
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="glass border-white/10 sm:max-w-[425px] overflow-hidden rounded-[2.5rem] p-0 gap-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] pointer-events-none" />
        
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-white">Edit Assignment</DialogTitle>
            <p className="text-sm text-white/40 font-medium">Configure departments for {memberName}</p>
          </DialogHeader>

          <div className="space-y-6">
            {memberRole === "manager" && (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gold">Manager Type</Label>
                <div className="grid gap-2">
                  {["general", "department"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setManagerType(type as "general" | "department");
                        if (type === "general") {
                          setSelectedDeptId(null);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all text-left",
                        managerType === type
                          ? "bg-gold/10 border-gold/30"
                          : "bg-white/[0.02] border-white/5 hover:border-white/20"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold",
                        managerType === type ? "text-gold" : "text-white/60"
                      )}>
                        {type === "general" ? "General Manager" : "Department Manager"}
                      </span>
                      {managerType === type && <Check className="w-4 h-4 text-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gold">
                {memberRole === "manager" && managerType === "general" ? "All Departments (General Access)" : memberRole === "manager" ? "Assigned Department" : "Primary Department"}
              </Label>
              <div className="grid gap-2 w-full max-w-sm mx-auto">
                {memberRole === "manager" && managerType === "general" ? (
                  <p className="text-xs text-white/40 italic text-center py-4">General Managers have access to all departments</p>
                ) : (
                  departments.map(dept => {
                    const isSelected = memberRole === "manager"
                      ? selectedDeptId === dept.id
                      : selectedDeptId === dept.id;

                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => {
                          if (memberRole === "manager") {
                            setSelectedDeptId(isSelected ? null : dept.id);
                          } else {
                            setSelectedDeptId(dept.id);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-2xl border transition-all text-left group",
                          isSelected
                            ? "bg-gold/10 border-gold/30"
                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                            style={{ backgroundColor: dept.color }}
                          />
                          <span className={cn(
                            "text-sm font-bold",
                            isSelected ? "text-gold" : "text-white/60 group-hover:text-white"
                          )}>
                            {dept.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-gold" />}
                      </button>
                    );
                  })
                )}
                {departments.length === 0 && (
                  <p className="text-xs text-white/30 italic">No departments created yet.</p>
                )}
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full btn-gold rounded-full h-12 text-xs font-black uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
