"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerUser({ email, password, fullName });
      if (!result.success) throw new Error(result.error);

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) throw new Error("Account created but sign-in failed. Please log in manually.");

      router.push("/onboarding/industry");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-[2rem] p-6 md:p-8 border-white/5 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Create account</h1>
        <p className="text-white/50 text-sm font-medium">Start your free 14-day trial today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[11px] font-semibold text-white/70 ml-1">Full name</Label>
            <Input
              id="name" placeholder="Jane Smith"
              className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-white/70 ml-1">Work email</Label>
            <Input
              id="email" type="email" placeholder="jane@company.com"
              className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-white/70 ml-1">Password</Label>
            <div className="relative">
              <Input
                id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4 pr-12"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
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

        <div className="space-y-4 pt-2">
          <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <input 
              type="checkbox" 
              id="terms" 
              required
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/20 text-gold focus:ring-gold/50 focus:ring-offset-0 cursor-pointer accent-gold"
            />
            <Label htmlFor="terms" className="text-xs text-white/70 leading-relaxed font-medium cursor-pointer flex-1">
              I agree to the <Link href="/terms" className="text-gold hover:underline" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="text-gold hover:underline" target="_blank">Privacy Policy</Link>.
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 btn-gold rounded-full text-sm font-bold shadow-lg shadow-gold/20"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create account
          </Button>

          <p className="text-xs text-white/40 text-center font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-bold">Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
