"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase exchanges the hash token and fires PASSWORD_RECOVERY event.
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // If the user lands with a valid session already (some flows), also set ready.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      toast({ title: "Failed to update password", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-white/5 shadow-2xl text-center animate-in fade-in zoom-in duration-500 flex flex-col justify-center max-h-full overflow-y-auto no-scrollbar">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] shrink-0">
          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-gold" />
        </div>
        <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-2">Password updated!</h2>
        <p className="text-white/50 text-xs md:text-sm font-medium">Redirecting you to sign in…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-white/5 shadow-2xl text-center flex flex-col justify-center items-center max-h-full overflow-y-auto no-scrollbar">
        <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gold mx-auto mb-3 md:mb-4 shrink-0" />
        <p className="text-white/50 text-xs md:text-sm font-medium">Verifying reset link…</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-white/5 shadow-2xl flex flex-col justify-center max-h-full overflow-y-auto no-scrollbar">
      <div className="text-center mb-4 md:mb-5">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3 md:mb-4 shrink-0">
          <KeyRound className="w-4 h-4 md:w-5 md:h-5 text-gold" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-0.5">Set new password</h1>
        <p className="text-white/50 text-[12px] md:text-sm font-medium">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-4">
        <div className="space-y-1 md:space-y-1.5">
          <Label htmlFor="password" className="text-xs md:text-sm font-semibold text-white/70 ml-1">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-10 md:h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

        <div className="space-y-1 md:space-y-1.5">
          <Label htmlFor="confirm" className="text-xs md:text-sm font-semibold text-white/70 ml-1">Confirm password</Label>
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 md:h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="pt-1 md:pt-2">
          <Button
            type="submit"
            className="w-full h-10 md:h-11 btn-gold rounded-full text-xs md:text-sm font-bold shadow-lg shadow-gold/20"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}
