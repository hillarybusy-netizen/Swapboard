"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateMemberDepartments } from "@/lib/actions/profile";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, PencilLine, Check, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { catchError } from "@/lib/errors";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Props {
  memberId: string;
  memberName: string;
  memberRole: "worker" | "manager" | "org_admin";
  currentDeptId?: string | null;
  currentDeptIds?: string[] | null;
  currentManagerType?: "general" | "department" | null;
  departments: Department[];
}

export function EditMemberDialog({ memberId, memberName, memberRole, currentDeptId, currentDeptIds, currentManagerType, departments }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(currentDeptId ?? null);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(currentDeptIds ?? []);
  const [managerType, setManagerType] = useState<"general" | "department">(currentManagerType ?? "general");

  const displayedDepartments = departments.filter((dept) => {
    if (memberRole === "worker") return selectedDeptId === dept.id;
    if (memberRole === "manager" && managerType === "general") return true;
    if (memberRole === "manager") return selectedDeptId === dept.id;
    return false;
  });

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
        title: "Update Failed",
        description: catchError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setIsEditing(false);
      }}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-colors">
          <Eye className="w-3.5 h-3.5" />
          See Details
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] bg-[#0a0a0a] border-white/10 rounded-[2rem] p-0 gap-0 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] pointer-events-none" />

        <div className="p-5 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-white">
              {isEditing ? "Edit Assignment" : "Staff Profile"}
            </DialogTitle>
            <p className="text-sm text-white/40 font-medium">
              {isEditing
                ? `Update department access for ${memberName}.`
                : `Review ${memberName}'s assignment and access details.`}
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {!isEditing ? (
              <>
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold/80 mb-1">Member</p>
                        <p className="text-base font-black text-white">{memberName}</p>
                      </div>
                      <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gold">
                        {memberRole}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Member Role
                    </div>
                    <p className="text-sm font-bold text-white capitalize">{memberRole}</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold mb-2">
                      <Building2 className="w-3.5 h-3.5" />
                      Department Access
                    </div>
                    {displayedDepartments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {displayedDepartments.map((dept) => (
                          <span
                            key={dept.id}
                            className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest"
                            style={{ backgroundColor: dept.color, color: "#050505" }}
                          >
                            {dept.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/40">No department assignment yet</p>
                    )}
                  </div>

                  {memberRole === "manager" && (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Access Type
                      </div>
                      <p className="text-sm font-bold text-white capitalize">{managerType}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full btn-gold rounded-full h-12 text-xs font-black uppercase tracking-widest"
                >
                  <PencilLine className="w-4 h-4 mr-2" />
                  Edit Assignment
                </Button>
              </>
            ) : (
              <>
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
                    {memberRole === "manager" && managerType === "general"
                      ? "All Departments (General Access)"
                      : memberRole === "manager"
                        ? "Assigned Department"
                        : "Primary Department"}
                  </Label>
                  <div className="grid gap-2 w-full max-w-sm mx-auto">
                    {memberRole === "manager" && managerType === "general" ? (
                      <p className="text-xs text-white/40 italic text-center py-4">General Managers have access to all departments</p>
                    ) : (
                      departments.map((dept) => {
                        const isSelected = selectedDeptId === dept.id;

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

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 rounded-full h-12 text-xs font-black uppercase tracking-widest border-white/10 text-white/70"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 btn-gold rounded-full h-12 text-xs font-black uppercase tracking-widest"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
