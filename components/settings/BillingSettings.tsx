import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getTrialStatus } from "@/lib/trial";
import { CheckCircle2, Zap } from "lucide-react";
import type { Organization } from "@/lib/database.types";

const PLANS = [
  { name: "Starter", price: "$29", period: "/mo", features: ["Up to 25 team members", "Unlimited swaps", "Email notifications", "Basic analytics"] },
  { name: "Pro", price: "$79", period: "/mo", features: ["Unlimited team members", "Priority support", "Advanced ROI analytics", "Custom departments", "API access"], highlight: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Dedicated CSM", "SLA guarantee", "SSO / SAML", "White-label option", "Custom integrations"] },
];

export function BillingSettings({ org }: { org: Organization | null }) {
  const trial = getTrialStatus(org);

  return (
    <div className="space-y-6">
      {trial.isOnTrial && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base">Free Trial</CardTitle>
            <CardDescription>{trial.daysRemaining} days remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={trial.percentUsed} className="h-2 bg-amber-200 [&>div]:bg-amber-500" />
            <p className="text-xs text-muted-foreground mt-2">
              Trial started {new Date(org!.trial_started_at).toLocaleDateString()} · Ends {new Date(org!.trial_ends_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.highlight ? "border-primary shadow-md ring-1 ring-primary" : ""}>
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
              <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                <Zap className="w-4 h-4" />
                {plan.price === "Custom" ? "Contact sales" : "Upgrade to " + plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Need help choosing? Email us at <span className="font-medium">hello@swapboard.app</span>
      </p>
    </div>
  );
}
