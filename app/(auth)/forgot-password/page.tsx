"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({ title: "Failed to send reset email", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-8 border-white/5 shadow-2xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
          <CheckCircle2 className="w-8 h-8 text-gold" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white mb-2">Check your inbox</h2>
        <p className="text-white/50 text-sm font-medium leading-relaxed mb-6 max-w-xs mx-auto">
          We sent a password reset link to <span className="text-white/80 font-bold">{email}</span>. It expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border-white/5 shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-gold" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Reset your password</h1>
        <p className="text-white/50 text-[13px] md:text-sm font-medium">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-white/70 ml-1">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            className="w-full h-11 btn-gold rounded-full text-sm font-bold shadow-lg shadow-gold/20"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Send reset link
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
