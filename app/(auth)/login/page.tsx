"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"email" | "member">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentialError, setCredentialError] = useState<string>("");
  const [showNoAccount, setShowNoAccount] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setCredentialError("");
    setShowNoAccount(false);
    try {
      const supabase = createClient();
      let targetEmail = email.trim().toLowerCase();
      let identifierType = "email";

      if (loginMode === "member") {
        identifierType = "Member ID";
        const { data: lookedUpEmail, error: rpcError } = await supabase
          .rpc("get_email_by_member_id", { p_member_id: memberId.trim().toUpperCase() });
        if (rpcError) throw rpcError;
        if (!lookedUpEmail) {
          setShowNoAccount(true);
          return;
        }
        targetEmail = lookedUpEmail.trim().toLowerCase();
      }

      const res = await signInUser({ email: targetEmail, password, honeypot });
      if (!res.success) {
        if (res.error === "no_registered_account") {
          setShowNoAccount(true);
        } else {
          setCredentialError(`Incorrect ${identifierType} or password`);
        }
        return;
      }

      // Guard against partial/invalid accounts with no organization.
      // Keep user on login with a clear message instead of redirecting to onboarding.
      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();
      const currentUserId = signedInUser?.id;
      if (!currentUserId) {
        await supabase.auth.signOut();
        setShowNoAccount(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", currentUserId)
        .maybeSingle();

      if (!profile?.organization_id) {
        await supabase.auth.signOut();
        setShowNoAccount(true);
        return;
      }

      if (res.userRole === "worker") {
        router.push("/home");
      } else if (res.userRole === "org_admin") {
        router.push("/admin");
      } else if (res.userRole === "super_admin") {
        router.push("/super-admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-white/5 shadow-2xl w-full">
      <div className="text-center mb-4 md:mb-5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-0.5">Welcome back</h1>
        <p className="text-white/50 text-[12px] md:text-sm font-medium">Sign in to your SwapBoard account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-4">
        {/* Toggle Mode */}
        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 mb-4 md:mb-5">
          <button
            type="button"
            onClick={() => setLoginMode("email")}
            className={cn(
              "flex-1 py-1.5 md:py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all",
              loginMode === "email" ? "bg-gold text-[#050505] shadow-lg shadow-gold/20" : "text-white/40 hover:text-white"
            )}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("member")}
            className={cn(
              "flex-1 py-1.5 md:py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all",
              loginMode === "member" ? "bg-gold text-[#050505] shadow-lg shadow-gold/20" : "text-white/40 hover:text-white"
            )}
          >
            Member ID
          </button>
        </div>

        <div className="space-y-2.5 md:space-y-3">
          {loginMode === "email" ? (
            <div className="space-y-1 md:space-y-1.5">
              <Label htmlFor="email" className="text-xs md:text-sm font-semibold text-white/70 ml-1">Email</Label>
              <Input
                id="email" type="email" placeholder="you@company.com"
                className="h-10 md:h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
                value={email} onChange={(e) => setEmail(e.target.value)} required={loginMode === "email"} autoComplete="email"
              />
            </div>
          ) : (
            <div className="space-y-1 md:space-y-1.5">
              <Label htmlFor="memberId" className="text-xs md:text-sm font-semibold text-white/70 ml-1">Member ID</Label>
              <Input
                id="memberId" type="text" placeholder="CO001"
                className="h-10 md:h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4 uppercase"
                value={memberId} onChange={(e) => setMemberId(e.target.value)} required={loginMode === "member"}
                autoCapitalize="characters"
              />
            </div>
          )}
          <div className="space-y-1 md:space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" title="" className="text-xs md:text-sm font-semibold text-white/70">Password</Label>
              <Link href="/forgot-password" className="text-xs text-gold/60 hover:text-gold transition-colors font-medium">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input
                id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                className="h-10 md:h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4 pr-12"
                value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" maxLength={72}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Honeypot Field — invisible to humans, automated bots fill it */}
        <div aria-hidden="true" style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1, overflow: 'hidden' }}>
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="space-y-3 md:space-y-4 pt-1 md:pt-2">
          <Button
            type="submit"
            className="w-full h-10 md:h-11 btn-gold rounded-full text-xs md:text-sm font-bold shadow-lg shadow-gold/20"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Sign in
          </Button>

          {credentialError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-red-300">{credentialError}</p>
              </div>
            </div>
          )}

          {showNoAccount && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-red-300 mb-1">No registered account found</p>
                <p className="text-[10px] md:text-xs text-red-200/80 mb-2">We couldn&apos;t find an account with this email. Create a new account to get started.</p>
                <Link href="/onboarding/industry" className="text-xs font-bold text-red-300 hover:text-red-200 transition-colors underline">
                  Sign up now →
                </Link>
              </div>
            </div>
          )}

          <p className="text-xs text-white/40 text-center font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/onboarding/industry" className="text-gold hover:text-gold-light transition-colors font-bold">
              Start free trial
            </Link>
          </p>
        </div>
      </form>
      <Link href="/dashboard" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
