"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getInvitationByToken, acceptInvitation } from "@/lib/actions/invitations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [successId, setSuccessId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setLoadError("missing_token");
        setFetching(false);
        return;
      }
      const result = await getInvitationByToken(token);
      if (!result.success) {
        setLoadError(result.error);
        setFetching(false);
        return;
      }
      setInvite(result.invitation);
      if (result.invitation.email) setEmail(result.invitation.email);
      setFetching(false);
    }
    loadInvite();
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!invite) return;
    setLoading(true);
    try {
      const result = await acceptInvitation({
        token: token!,
        email,
        fullName,
        password,
      });
      if (!result.success) throw new Error(result.error);

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email!,
        password,
      });
      if (signInError) throw new Error("Account created but sign-in failed. Please log in manually.");

      setSuccessId(result.memberId || "");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!invite) return (
    <Card className="glass border-white/5">
      <CardContent className="py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-red-500/40" />
        </div>
        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
          {loadError === "missing_token" ? "Invalid Link" : "Expired or Invalid"}
        </h2>
        <p className="text-sm text-white/40 font-medium max-w-xs mx-auto">
          {loadError === "missing_token"
            ? "This invitation link is missing a token. Please use the full link from your email or manager."
            : "This invitation link has expired or has already been used. Please ask your manager for a new link."}
        </p>
        <Button className="mt-8 btn-gold rounded-full px-8" asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      </CardContent>
    </Card>
  );

  if (successId !== null) {
    return (
      <Card className="glass border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10" />
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white italic">Welcome to the Team!</CardTitle>
          <CardDescription className="text-white/40 text-xs font-medium">
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center pb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Member ID</p>
            <p className="text-3xl font-black text-gold tracking-widest">{successId || "Generating..."}</p>
            <p className="text-[11px] text-white/40 font-medium">
              Please save this ID. You can use it along with your password to log in in the future.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              if (invite.user_role === "worker") {
                router.push("/my-shifts");
              } else {
                router.push("/dashboard");
              }
              router.refresh();
            }} 
            className="w-full btn-gold rounded-full h-12 uppercase font-black text-xs tracking-widest"
          >
            Go to My Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10" />
      <CardHeader>
        <CardTitle className="text-2xl font-black uppercase tracking-tight text-white italic">Join the Team</CardTitle>
        <CardDescription className="text-white/40 text-xs font-medium">
          You&apos;ve been invited to join <strong>{(invite.organization as any)?.name}</strong> as a {invite.user_role}.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAccept}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Address</Label>
            <Input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!invite.email} 
              placeholder="you@example.com"
              className="bg-white/5 border-white/10 rounded-xl h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Full Name</Label>
            <Input 
              placeholder="Jane Smith" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="bg-white/5 border-white/10 rounded-xl h-11"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Create Password</Label>
            <Input 
              type="password" 
              placeholder="Min. 8 characters" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-white/5 border-white/10 rounded-xl h-11"
              required 
              minLength={8} 
            />
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <Button type="submit" className="w-full btn-gold rounded-full h-12 uppercase font-black text-xs tracking-widest" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Complete Onboarding
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
