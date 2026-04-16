"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { INDUSTRY_ICONS, INDUSTRY_LABELS } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Organization } from "@/lib/database.types";

export function OrgSettings({ org, userId }: { org: Organization | null; userId: string }) {
  const router = useRouter();
  const [name, setName] = useState(org?.name ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!org) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("organizations").update({ name }).eq("id", org.id);
      if (error) throw error;
      toast({ title: "Saved!", variant: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization details</CardTitle>
        <CardDescription>Basic information about your business</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Business name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business name" />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {org ? `${INDUSTRY_ICONS[org.industry]} ${INDUSTRY_LABELS[org.industry]}` : "—"}
            </Badge>
            <span className="text-xs text-muted-foreground">Contact support to change industry</span>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading || name === org?.name}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
