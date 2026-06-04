"use client";
import { useState } from "react";
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
  { id: "starter", name: "Starter", price: "$79", period: "/mo", features: ["Up to 50 workers", "3 departments", "Basic analytics", "Email support"] },
  { id: "pro", name: "Growth", price: "$199", period: "/mo", features: ["Up to 200 workers", "Unlimited departments", "ROI analytics", "Priority support", "Custom roles"], highlight: true },
  { id: "enterprise", name: "Enterprise", price: "$499", period: "/mo", features: ["Unlimited workers", "Multi-location", "Advanced analytics", "Dedicated support", "SSO & compliance"] },
];

export function BillingSettings({ org }: { org: Organization | null }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<typeof PLANS[0] | null>(null);
  const trial = getTrialStatus(org);

  async function handleSelectPlan(plan: typeof PLANS[0]) {
    if (!org) return;

    // Check for downgrade
    const missingFeatures = getMissingFeatures(org.plan, plan.id as Plan);
    
    if (missingFeatures.length > 0) {
      setConfirmPlan(plan);
      return;
    }

    executeUpgrade(plan.id);
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
      setConfirmPlan(null);
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

      <AlertDialog open={!!confirmPlan} onOpenChange={() => setConfirmPlan(null)}>
        <AlertDialogContent className="glass border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Confirm Plan Downgrade
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>You are moving to a lower tier than your current plan. You will lose access to the following features:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                {confirmPlan && getMissingFeatures(org?.plan || "trial", confirmPlan.id as Plan).map(f => (
                  <li key={f} className="text-sm">{f}</li>
                ))}
              </ul>
              <p className="font-bold text-white">Are you sure you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmPlan && executeUpgrade(confirmPlan.id)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full"
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
