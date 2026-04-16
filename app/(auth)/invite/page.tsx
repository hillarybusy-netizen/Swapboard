"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadInvite() {
      if (!token) { setFetching(false); return; }
      const supabase = createClient();
      const { data } = await supabase.from("invitations").select("*, organization:organizations(*)").eq("token", token).is("accepted_at", null).single();
      setInvite(data);
      setFetching(false);
    }
    loadInvite();
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!invite) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      await supabase.from("profiles").update({
        organization_id: invite.organization_id,
        department_id: invite.department_id,
        user_role: invite.user_role,
        onboarding_complete: true,
      }).eq("id", user!.id);
      await supabase.from("invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
      router.push("/my-shifts");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!invite) return (
    <Card>
      <CardContent className="py-10 text-center text-muted-foreground">
        <p>This invite link is invalid or has already been used.</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>You&apos;ve been invited!</CardTitle>
        <CardDescription>
          Join <strong>{(invite.organization as any)?.name}</strong> on SwapBoard as a {invite.user_role}.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAccept}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={invite.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Your name</Label>
            <Input placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Create a password</Label>
            <Input type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Join {(invite.organization as any)?.name}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <InviteForm />
    </Suspense>
  );
}
