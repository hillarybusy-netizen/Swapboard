"use client";
import { catchError } from "@/lib/errors";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateOrganizationLogo } from "@/lib/actions/org";
import { toast } from "@/hooks/use-toast";
import { INDUSTRY_ICONS, INDUSTRY_LABELS } from "@/lib/utils";
import { getTrialStatus } from "@/lib/trial";
import { PLAN_LIMITS } from "@/lib/plans";
import { Loader2, Upload, Users, Building2, CreditCard, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Organization, Plan } from "@/lib/database.types";

interface OrgSettingsProps {
  org: Organization | null;
  userId: string;
  profileCount: number;
  departmentCount: number;
}

export function OrgSettings({ org, userId, profileCount, departmentCount }: OrgSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(org?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = (org?.settings as any)?.logo_url;
  const initials = org?.name ? org.name.substring(0, 2).toUpperCase() : "O";
  const plan = (org?.plan as Plan) ?? "trial";
  const planInfo = PLAN_LIMITS[plan];
  const trial = getTrialStatus(org);

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
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
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
      toast({ title: "Upload failed", description: catchError(err), variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Organization</h2>
        <p className="text-sm text-white/40 mt-1">Workspace details and usage overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 text-white/30 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Plan</span>
          </div>
          <p className="text-sm font-black text-white">{planInfo.label}</p>
          {trial.isOnTrial && !trial.isExpired && (
            <p className="text-[10px] text-gold/70 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {trial.daysRemaining} days left
            </p>
          )}
        </div>
        <div className="glass rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 text-white/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Members</span>
          </div>
          <p className="text-sm font-black text-white">
            {profileCount}
            <span className="text-white/30 font-bold"> / {planInfo.maxWorkers}</span>
          </p>
        </div>
        <div className="glass rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 text-white/30 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Departments</span>
          </div>
          <p className="text-sm font-black text-white">
            {departmentCount}
            <span className="text-white/30 font-bold"> / {planInfo.maxDepartments}</span>
          </p>
        </div>
        <div className="glass rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 text-white/30 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest">Industry</span>
          </div>
          <p className="text-sm font-black text-white truncate">
            {org ? `${INDUSTRY_ICONS[org.industry]} ${INDUSTRY_LABELS[org.industry]}` : "—"}
          </p>
        </div>
      </div>

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
    </div>
  );
}
