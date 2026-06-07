"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateOrganizationName, updateOrganizationLogo } from "@/lib/actions/org";
import { toast } from "@/hooks/use-toast";
import { INDUSTRY_ICONS, INDUSTRY_LABELS } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Organization } from "@/lib/database.types";

export function OrgSettings({ org, userId }: { org: Organization | null; userId: string }) {
  const router = useRouter();
  const [name, setName] = useState(org?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = (org?.settings as any)?.logo_url;
  const initials = org?.name ? org.name.substring(0, 2).toUpperCase() : "O";

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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !org) return;

    setUploadingLogo(true);
    try {
      const supabase = createClient();
      
      const fileExt = file.name.split(".").pop();
      const filePath = `${org.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      await updateOrganizationLogo(org.id, publicUrl);
      
      toast({ title: "Logo uploaded!", variant: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization details</CardTitle>
        <CardDescription>Basic information about your business</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20 border border-white/10 shadow-lg">
            <AvatarImage src={logoUrl || ""} alt="Company Logo" />
            <AvatarFallback className="bg-gold/10 text-gold text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Company Logo</h4>
            <p className="text-xs text-white/40">Upload a square image (PNG, JPG) max 2MB.</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload Logo
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/png, image/jpeg" 
                className="hidden" 
              />
            </div>
          </div>
        </div>

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
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
