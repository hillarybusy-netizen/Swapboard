"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      router.push("/onboarding/industry");
      router.refresh();
    } catch (err: any) {
      console.error("Signup error details:", err);
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
            <Label htmlFor="password" title="" className="text-sm font-semibold text-white/70 ml-1">Password</Label>
            <Input
              id="password" type="password" placeholder="Min. 8 characters"
              className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
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

          <p className="text-[9px] text-white/20 text-center leading-relaxed">
            By creating an account you agree to our <br/>
            <Link href="#" className="underline hover:text-white/40">Terms of Service</Link> and <Link href="#" className="underline hover:text-white/40">Privacy Policy</Link>.
          </p>
        </div>
      </form>
      <Link href="/onboarding/industry" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
