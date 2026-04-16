"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

interface Role { id: string; name: string; min_hours_notice: number }
interface Dept { id: string; name: string; color: string; roles: Role[] }

export function DepartmentEditor({ departments, orgId }: { departments: Dept[]; orgId: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newRoleNames, setNewRoleNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function addDepartment() {
    if (!newDeptName.trim()) return;
    setLoading("new-dept");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("departments").insert({ organization_id: orgId, name: newDeptName.trim(), color: "#6366f1", sort_order: departments.length });
      if (error) throw error;
      setNewDeptName("");
      toast({ title: "Department added", variant: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function deleteDepartment(id: string) {
    setLoading(`del-${id}`);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Department deleted" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function addRole(deptId: string) {
    const name = newRoleNames[deptId]?.trim();
    if (!name) return;
    setLoading(`role-${deptId}`);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("roles").insert({ organization_id: orgId, department_id: deptId, name, min_hours_notice: 4 });
      if (error) throw error;
      setNewRoleNames((v) => ({ ...v, [deptId]: "" }));
      toast({ title: "Role added", variant: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function deleteRole(id: string) {
    setLoading(`del-role-${id}`);
    try {
      const supabase = createClient();
      await supabase.from("roles").delete().eq("id", id);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments & Roles</CardTitle>
        <CardDescription>Customize your team structure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {departments.map((dept) => (
          <div key={dept.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
              onClick={() => setExpanded(expanded === dept.id ? null : dept.id)}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
              <span className="font-medium flex-1">{dept.name}</span>
              <span className="text-xs text-muted-foreground">{dept.roles.length} role{dept.roles.length !== 1 ? "s" : ""}</span>
              {expanded === dept.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <button
                onClick={(e) => { e.stopPropagation(); deleteDepartment(dept.id) }}
                className="ml-1 p-1 hover:text-destructive transition-colors text-muted-foreground"
                disabled={loading === `del-${dept.id}`}
              >
                {loading === `del-${dept.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </button>

            {expanded === dept.id && (
              <div className="px-3 pb-3 border-t bg-muted/20 space-y-2">
                {dept.roles.length > 0 ? (
                  <div className="pt-2 space-y-1">
                    {dept.roles.map((role) => (
                      <div key={role.id} className="flex items-center gap-2 text-sm py-1">
                        <span className="flex-1">{role.name}</span>
                        <span className="text-xs text-muted-foreground">{role.min_hours_notice}h notice</span>
                        <button onClick={() => deleteRole(role.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground pt-2">No roles yet</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="New role name"
                    value={newRoleNames[dept.id] ?? ""}
                    onChange={(e) => setNewRoleNames((v) => ({ ...v, [dept.id]: e.target.value }))}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addRole(dept.id)}
                  />
                  <Button size="sm" variant="outline" onClick={() => addRole(dept.id)} disabled={loading === `role-${dept.id}`}>
                    {loading === `role-${dept.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
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
