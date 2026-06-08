"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { PLAN_LIMITS, BILLABLE_PLANS, getMissingFeatures } from "@/lib/plans";
import { createCheckoutSession, completeCheckout, updatePlan } from "@/app/actions";
import { toast } from "@/hooks/use-toast";

const PLANS = BILLABLE_PLANS.map((id) => ({
  id,
  name: PLAN_LIMITS[id].label,
  price: PLAN_LIMITS[id].priceLabel,
  priceNumeric: PLAN_LIMITS[id].price,
  period: "/mo",
  features: PLAN_LIMITS[id].features,
  highlight: PLAN_LIMITS[id].highlight,
}));

export function BillingSettings({ org }: { org: Organization | null }) {
  const searchParams = useSearchParams();
  const checkoutHandled = useRef(false);
  const cancelHandled = useRef(false);
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

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const checkout = searchParams.get("checkout");

    if (checkout === "cancelled" && !cancelHandled.current) {
      cancelHandled.current = true;
      toast({ title: "Payment Cancelled", description: "You closed the payment screen." });
      return;
    }

    if (!sessionId || checkoutHandled.current) return;
    checkoutHandled.current = true;

    setLoading("checkout");
    completeCheckout(sessionId).catch((err: Error) => {
      setLoading(null);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    });
  }, [searchParams]);

  async function payWithStripe(plan: typeof PLANS[0]) {
    if (!org) return;

    setLoading(plan.id);
    try {
      const { url } = await createCheckoutSession(org.id, plan.id);
      window.location.href = url;
    } catch (e: unknown) {
      setLoading(null);
      const message = e instanceof Error ? e.message : "Failed to initialize payment.";
      toast({ title: "Stripe Error", description: message, variant: "destructive" });
    }
  }

  async function handleSelectPlan(plan: typeof PLANS[0]) {
    if (!org) return;
    const currentLevel = PLAN_LEVELS[org.plan] ?? 0;
    const targetLevel = PLAN_LEVELS[plan.id] ?? 0;
    if (targetLevel > currentLevel) setConfirmUpgrade(plan);
    else if (targetLevel < currentLevel) setConfirmDowngrade(plan);
  }

  async function executeDowngrade(planId: string) {
    if (!org) return;
    setLoading(planId);
    try {
      await updatePlan(org.id, planId);
      toast({ title: "Plan updated!", variant: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(null);
      setConfirmDowngrade(null);
    }
  }

  return (
    <div className="space-y-6">
      {trial.isOnTrial && (
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl -z-10" />
          <CardHeader>
            <CardTitle className="text-base text-amber-400 font-bold">Trial Period</CardTitle>
            <CardDescription className="text-amber-300/60">{trial.daysRemaining} days remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={trial.percentUsed} className="h-2 bg-amber-950/50 [&>div]:bg-amber-500" />
            <p className="text-[10px] text-amber-400/80 mt-2 font-black uppercase tracking-widest">Previewing Growth Features</p>
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
              {plan.highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-2xl -z-10" />}
              <CardHeader className="pb-4">
                {plan.highlight && (
                  <Badge className="w-fit mb-2 bg-gold text-[#050505] font-black uppercase tracking-widest text-[9px] hover:bg-gold/90">Most popular</Badge>
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
                  {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
                  {isCurrent ? "Current Plan" : "Choose " + plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                Proceeding will redirect you to Stripe secure checkout. Once payment is confirmed, your new limits will take effect immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmUpgrade) {
                  const targetPlan = confirmUpgrade;
                  setConfirmUpgrade(null);
                  payWithStripe(targetPlan);
                }
              }}
              className="bg-gold hover:bg-gold/90 text-[#050505] font-black uppercase tracking-widest text-[10px] rounded-full px-6"
            >
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDowngrade} onOpenChange={() => setConfirmDowngrade(null)}>
        <AlertDialogContent className="glass bg-[#0a0a0a]/95 border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500 font-black uppercase tracking-wider text-base">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Plan Downgrade
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-white text-sm">You are moving to a lower tier. You will lose access to:</p>
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
                  executeDowngrade(confirmDowngrade.id);
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
