"use client";
import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "@/lib/actions/auth";
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
      const result = await sendPasswordResetEmail(email.trim());
      if (!result.success) throw new Error(result.error ?? "Failed to send reset email");
      setSent(true);
    } catch (err: any) {
      toast({ title: "Failed to send reset email", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-white/5 shadow-2xl text-center animate-in fade-in zoom-in duration-500 w-full">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] shrink-0">
          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-gold" />
        </div>
        <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-2">Check your inbox</h2>
        <p className="text-white/50 text-xs md:text-sm font-medium leading-relaxed mb-4 md:mb-6 max-w-xs mx-auto">
          We sent a password reset link to <span className="text-white/80 font-bold">{email}</span>. It expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40 hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-white/5 shadow-2xl w-full">
      <div className="text-center mb-4 md:mb-5">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3 md:mb-4 shrink-0">
          <Mail className="w-4 h-4 md:w-5 md:h-5 text-gold" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-0.5">Reset your password</h1>
        <p className="text-white/50 text-[12px] md:text-sm font-medium">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-4">
        <div className="space-y-1 md:space-y-1.5">
          <Label htmlFor="email" className="text-xs md:text-sm font-semibold text-white/70 ml-1">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-10 md:h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-gold/50 focus:border-gold/50 transition-all px-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-3 md:space-y-4 pt-1 md:pt-2">
          <Button
            type="submit"
            className="w-full h-10 md:h-11 btn-gold rounded-full text-xs md:text-sm font-bold shadow-lg shadow-gold/20"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Send reset link
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
