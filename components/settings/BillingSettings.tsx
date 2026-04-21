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
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">Trial Period</CardTitle>
            <CardDescription className="text-amber-700">{trial.daysRemaining} days remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={trial.percentUsed} className="h-2 bg-amber-200 [&>div]:bg-amber-500" />
            <p className="text-[10px] text-amber-600 mt-2 font-medium uppercase tracking-wider">
              Previewing Growth Features
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = org?.plan === plan.id;
          return (
            <Card key={plan.id} className={plan.highlight ? "border-primary shadow-md ring-1 ring-primary" : ""}>
              <CardHeader className="pb-3">
                {plan.highlight && <Badge className="w-fit mb-1">Most popular</Badge>}
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={isCurrent || !!loading}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
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
