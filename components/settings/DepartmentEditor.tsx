"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2, Lock } from "lucide-react";
import { Organization } from "@/lib/database.types";
import { checkPlanLimit } from "@/lib/plans";
import { addDepartment as addDepartmentAction, deleteDepartment as deleteDepartmentAction } from "@/lib/actions/departments";

interface Dept { id: string; name: string; color: string; }

export function DepartmentEditor({ departments, orgId, org }: { departments: Dept[]; orgId: string; org: Organization }) {
  const router = useRouter();

  const [newDeptName, setNewDeptName] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const maxDepts = checkPlanLimit(org.plan, "maxDepartments");
  const isAtLimit = departments.length >= maxDepts;

  async function addDepartment() {
    if (!newDeptName.trim()) return;
    if (isAtLimit) {
      toast({ title: "Limit Reached", description: `Your ${org.plan} plan is limited to ${maxDepts} departments. Upgrade to Growth for unlimited.`, variant: "destructive" });
      return;
    }
    setLoading("new-dept");
    try {
      const res = await addDepartmentAction(orgId, newDeptName.trim(), departments.length);
      if (!res.success) throw new Error(res.error);
      
      setNewDeptName("");
      toast({ title: "Department added", variant: "success" });
      // Router refresh is handled inside the server action, but we'll do it here just in case for client state
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function deleteDepartment(id: string) {
    setLoading(`del-${id}`);
    try {
      await deleteDepartmentAction(orgId, id);
      toast({ title: "Department deleted" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments</CardTitle>
        <CardDescription>Customize your team structure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {departments.map((dept) => (
          <div key={dept.id} className="border rounded-lg overflow-hidden flex items-center justify-between p-3 bg-card">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
              <span className="font-medium">{dept.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteDepartment(dept.id) }}
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors text-muted-foreground"
              disabled={loading === `del-${dept.id}`}
            >
              {loading === `del-${dept.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        ))}

        {/* Add dept */}
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="New department name"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDepartment()}
          />
          <Button variant="outline" onClick={addDepartment} disabled={loading === "new-dept"}>
            {loading === "new-dept" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
