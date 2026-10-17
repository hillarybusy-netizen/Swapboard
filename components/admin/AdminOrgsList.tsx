"use client";

import { useState, useMemo, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";
import {
  Globe,
  CalendarDays,
  Search,
  Building2,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Clock,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Plan } from "@/lib/database.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  updateOrganizationPlan,
  extendOrganizationTrial,
  superAdminDeleteOrganization,
} from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";

const PLAN_BADGES: Record<string, { label: string; className: string }> = {
  trial: { label: "Trial", className: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  starter: { label: "Starter", className: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  growth: { label: "Growth", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  pro: { label: "Pro", className: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  enterprise: { label: "Enterprise", className: "bg-gold/20 text-gold border-gold/30" },
};

const PLANS = ["trial", "starter", "growth", "pro", "enterprise"] as const;

function OrgActions({ org }: { org: any }) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleChangePlan = (plan: string) => {
    startTransition(async () => {
      try {
        await updateOrganizationPlan(org.id, plan);
        toast({
          title: "Plan Updated",
          description: `${org.name} has been moved to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`,
        });
      } catch (err: any) {
        toast({
          title: "Failed to update plan",
          description: err?.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  };

  const handleExtendTrial = (days: number) => {
    startTransition(async () => {
      try {
        await extendOrganizationTrial(org.id, days);
        toast({
          title: "Trial Extended",
          description: `${org.name} trial extended by ${days} days.`,
        });
      } catch (err: any) {
        toast({
          title: "Failed to extend trial",
          description: err?.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await superAdminDeleteOrganization(org.id);
        toast({
          title: "Organization Deleted",
          description: `${org.name} and all its members have been permanently removed.`,
        });
        setDeleteDialogOpen(false);
      } catch (err: any) {
        toast({
          title: "Failed to delete organization",
          description: err?.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-xl"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#0f0f0f] border-white/10 text-white/70 min-w-[200px]"
        >
          {/* Change Plan submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400/60" />
              Change Plan
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#0f0f0f] border-white/10 text-white/70">
              {PLANS.map((plan) => (
                <DropdownMenuItem
                  key={plan}
                  onClick={() => handleChangePlan(plan)}
                  disabled={org.plan === plan}
                  className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      org.plan === plan ? "bg-gold" : "bg-white/20"
                    }`}
                  />
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  {org.plan === plan && (
                    <span className="ml-auto text-[9px] text-gold/60">Current</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Extend Trial submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400/60" />
              Extend Trial
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#0f0f0f] border-white/10 text-white/70">
              {[7, 14, 30, 60, 90].map((days) => (
                <DropdownMenuItem
                  key={days}
                  onClick={() => handleExtendTrial(days)}
                  className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs"
                >
                  <Clock className="w-3 h-3 text-amber-300/40" />
                  +{days} Days
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-white/5" />

          {/* Delete Organization */}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 focus:bg-red-500/10 focus:text-red-400 text-red-400/60 cursor-pointer text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Organization
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
              This will <span className="text-red-400 font-bold">permanently delete</span>{" "}
              <span className="text-white font-semibold">{org.name}</span> and all associated
              member accounts, shifts, swap requests, and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700 border-red-500"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AdminOrgsList({ orgs }: { orgs: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");

  const plans = ["all", "trial", "starter", "growth", "pro", "enterprise"];

  const filtered = useMemo(() => {
    return orgs.filter((org) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        org.name?.toLowerCase().includes(q) ||
        org.subdomain?.toLowerCase().includes(q) ||
        org.industry?.toLowerCase().includes(q);

      const matchesPlan = selectedPlan === "all" || org.plan === selectedPlan;

      return matchesSearch && matchesPlan;
    });
  }, [orgs, searchQuery, selectedPlan]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizations by name, subdomain, or industry..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs md:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-all font-medium"
          />
        </div>

        {/* Plan Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Plan:
          </span>
          {plans.map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                selectedPlan === plan
                  ? "bg-gold text-black shadow-lg shadow-gold/20 font-black"
                  : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations List */}
      {filtered.length === 0 ? (
        <div className="glass rounded-[2rem] p-12 text-center space-y-3 border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mx-auto">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-white/60">No organizations match your filters</p>
          <p className="text-xs text-white/30">Try clearing your search query or selecting a different plan filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-5">
          {filtered.map((org: any) => {
            const planBadge = PLAN_BADGES[org.plan] || { label: org.plan, className: "bg-white/5 text-white/40 border-white/10" };
            const planPrice = PLAN_LIMITS[org.plan as Plan]?.price || 0;

            return (
              <div
                key={org.id}
                className="glass rounded-[2rem] p-6 md:p-8 border-white/5 hover:border-gold/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-gold/[0.03] to-transparent blur-3xl -z-10" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Org Identity */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-xl font-black text-white/60 group-hover:border-gold/30 group-hover:text-gold transition-all shrink-0">
                      {org.name?.charAt(0) ?? "O"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <h2 className="text-lg font-black text-white tracking-tight group-hover:text-gold transition-colors">
                          {org.name}
                        </h2>
                        <Badge className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${planBadge.className}`}>
                          {planBadge.label}
                        </Badge>
                        {org.industry && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/5">
                            {org.industry}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-white/30 font-medium">
                        <span className="flex items-center gap-1 text-white/40 font-mono text-[11px]">
                          <Globe className="w-3 h-3 text-white/20" />
                          {org.subdomain ? `${org.subdomain}.swapboard.ca` : "app.swapboard.ca"}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-white/20">ID: {org.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex flex-wrap items-center gap-6 md:gap-8 justify-between lg:justify-end border-t border-white/5 pt-4 lg:border-t-0 lg:pt-0">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-white/20" />
                        Created
                      </p>
                      <p className="text-xs font-bold text-white/70">
                        {new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
                        Plan Rate
                      </p>
                      <p className="text-xs font-black text-gold">
                        {formatCurrency(planPrice)}
                        <span className="text-[10px] text-white/30 font-medium"> / mo</span>
                      </p>
                    </div>

                    {org.trial_ends_at && org.plan === "trial" && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/60 mb-1">
                          Trial Expires
                        </p>
                        <p className="text-xs font-bold text-amber-200">
                          {new Date(org.trial_ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    )}

                    {/* Actions Button */}
                    <OrgActions org={org} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
