"use client";
import { useState } from "react";
import Script from "next/script";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getTrialStatus } from "@/lib/trial";
import { CheckCircle2, Zap, AlertTriangle, Loader2 } from "lucide-react";
import type { Organization, Plan } from "@/lib/database.types";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { getMissingFeatures } from "@/lib/plans";
import { updatePlan } from "@/app/actions";
import { toast } from "@/hooks/use-toast";

const PLANS = [
  { id: "starter", name: "Starter", price: "$79", priceNumeric: 79, period: "/mo", features: ["Up to 50 workers", "3 departments", "Basic analytics", "Email support"] },
  { id: "pro", name: "Growth", price: "$199", priceNumeric: 199, period: "/mo", features: ["Up to 200 workers", "Unlimited departments", "ROI analytics", "Priority support", "Custom roles"], highlight: true },
  { id: "enterprise", name: "Enterprise", price: "$499", priceNumeric: 499, period: "/mo", features: ["Unlimited workers", "Multi-location", "Advanced analytics", "Dedicated support", "SSO & compliance"] },
];

export function BillingSettings({ org, userEmail }: { org: Organization | null; userEmail?: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<typeof PLANS[0] | null>(null);
  const [confirmDowngrade, setConfirmDowngrade] = useState<typeof PLANS[0] | null>(null);
  const trial = getTrialStatus(org);

  const PLAN_LEVELS: Record<string, number> = {
    trial: 0,
    starter: 1,
    pro: 2,
    enterprise: 3,
  };

  function payWithPaystack(plan: typeof PLANS[0], onCompleted: () => void) {
    // @ts-ignore
    if (typeof window === "undefined" || !window.PaystackPop) {
      toast({
        title: "Paystack loading...",
        description: "Please wait a moment for the payment window to load.",
        variant: "destructive",
      });
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_a6f23be3a7f805a5a1f64f2b05b8a531cfd03422";
    setLoading(plan.id);

    try {
      // @ts-ignore
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: paystackKey,
        email: userEmail || "customer@example.com",
        amount: plan.priceNumeric * 100, // minor units (cents for USD)
        currency: "USD",
        ref: "SB-" + Math.floor(Math.random() * 1000000000 + 1),
        onSuccess: function(response: any) {
          toast({
            title: "Payment Successful!",
            description: `Reference: ${response.reference}. Updating your plan...`,
            variant: "success",
          });
          onCompleted();
        },
        onCancel: function() {
          setLoading(null);
          toast({
            title: "Payment Cancelled",
            description: "You closed the payment screen.",
          });
        }
      });
    } catch (e: any) {
      setLoading(null);
      toast({
        title: "Paystack Error",
        description: e.message || "Failed to initialize payment.",
        variant: "destructive",
      });
    }
  }

  async function handleSelectPlan(plan: typeof PLANS[0]) {
    if (!org) return;

    const currentLevel = PLAN_LEVELS[org.plan] ?? 0;
    const targetLevel = PLAN_LEVELS[plan.id] ?? 0;

    if (targetLevel > currentLevel) {
      // Upgrade
      setConfirmUpgrade(plan);
    } else if (targetLevel < currentLevel) {
      // Downgrade
      setConfirmDowngrade(plan);
    }
  }

  async function executeUpgrade(planId: string) {
    if (!org) return;
    setLoading(planId);
    try {
      await updatePlan(org.id, planId);
      toast({ title: "Plan updated!", variant: "success" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
      setConfirmUpgrade(null);
      setConfirmDowngrade(null);
    }
  }

  return (
    <div className="space-y-6">
      <Script 
        src="https://js.paystack.co/v2/inline.js" 
        strategy="afterInteractive"
      />

      {trial.isOnTrial && (
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl -z-10" />
          <CardHeader>
            <CardTitle className="text-base text-amber-400 font-bold">Trial Period</CardTitle>
            <CardDescription className="text-amber-300/60">{trial.daysRemaining} days remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={trial.percentUsed} className="h-2 bg-amber-950/50 [&>div]:bg-amber-500" />
            <p className="text-[10px] text-amber-400/80 mt-2 font-black uppercase tracking-widest">
              Previewing Growth Features
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = org?.plan === plan.id;
          return (
            <Card 
              key={plan.id} 
              className={plan.highlight 
                ? "border-gold/40 bg-gold/5 shadow-2xl shadow-gold/5 relative overflow-hidden rounded-3xl" 
                : "border-white/5 bg-white/[0.02] relative overflow-hidden rounded-3xl"
              }
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-2xl -z-10" />
              )}
              <CardHeader className="pb-4">
                {plan.highlight && (
                  <Badge className="w-fit mb-2 bg-gold text-[#050505] font-black uppercase tracking-widest text-[9px] hover:bg-gold/90">
                    Most popular
                  </Badge>
                )}
                <CardTitle className="text-lg font-black text-white">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-white/40 text-xs font-medium">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.highlight
                    ? "w-full rounded-full bg-gold text-[#050505] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all h-11"
                    : "w-full rounded-full bg-white/5 text-white border-white/5 font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-[0.98] transition-all h-11"
                  }
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={isCurrent || !!loading}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 mr-1" />
                  )}
                  {isCurrent ? "Current Plan" : "Choose " + plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Dialog */}
      <AlertDialog open={!!confirmUpgrade} onOpenChange={() => setConfirmUpgrade(null)}>
        <AlertDialogContent className="glass bg-[#0a0a0a]/95 border-gold/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gold font-black uppercase tracking-wider text-base">
              <Zap className="w-5 h-5 text-gold" />
              Confirm Plan Upgrade
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-white text-sm">
                You are upgrading to the <span className="font-bold text-gold">{confirmUpgrade?.name}</span> plan ({confirmUpgrade?.price}/mo).
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                Proceeding will launch Paystack secure payment window. Once payment is confirmed, your new limits will take effect immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (confirmUpgrade) {
                  const targetPlan = confirmUpgrade;
                  setConfirmUpgrade(null); // Close dialog first to avoid stuck dialog UI
                  payWithPaystack(targetPlan, () => executeUpgrade(targetPlan.id));
                }
              }}
              className="bg-gold hover:bg-gold/90 text-[#050505] font-black uppercase tracking-widest text-[10px] rounded-full px-6"
            >
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Downgrade Dialog */}
      <AlertDialog open={!!confirmDowngrade} onOpenChange={() => setConfirmDowngrade(null)}>
        <AlertDialogContent className="glass bg-[#0a0a0a]/95 border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500 font-black uppercase tracking-wider text-base">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Plan Downgrade
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-white text-sm">
                You are moving to a lower tier than your current plan. You will lose access to the following features:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                {confirmDowngrade && getMissingFeatures(org?.plan || "trial", confirmDowngrade.id as Plan).map(f => (
                  <li key={f} className="text-sm">{f}</li>
                ))}
              </ul>
              <p className="font-bold text-white text-sm">Are you sure you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (confirmDowngrade) {
                  const targetPlan = confirmDowngrade;
                  setConfirmDowngrade(null); // Close dialog first to avoid stuck dialog UI
                  payWithPaystack(targetPlan, () => executeUpgrade(targetPlan.id));
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 font-black uppercase tracking-widest text-[10px]"
            >
              Yes, Downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs text-center text-muted-foreground">
        Need help choosing? Email us at <span className="font-medium">hello@swapboard.app</span>
      </p>
    </div>
  );
}
