"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrgStats {
  memberCount: number;
  departmentCount: number;
  shiftsThisWeek: number;
  swapsThisWeek: number;
  organizationName: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Get user's profile and organization
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id, user_role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.user_role !== "org_admin") {
          router.push("/dashboard");
          return;
        }

        const orgId = profile.organization_id;
        if (!orgId) {
          router.push("/onboarding/industry");
          return;
        }

        // Get organization details
        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", orgId)
          .single();

        // Get member count
        const { count: memberCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId);

        // Get department count
        const { count: departmentCount } = await supabase
          .from("departments")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId);

        // Get this week's shifts count
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const { count: shiftsThisWeek } = await supabase
          .from("shifts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .gte("start_time", weekStart.toISOString());

        // Get this week's swaps count
        const { count: swapsThisWeek } = await supabase
          .from("swap_requests")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .gte("requested_at", weekStart.toISOString());

        setStats({
          memberCount: memberCount || 0,
          departmentCount: departmentCount || 0,
          shiftsThisWeek: shiftsThisWeek || 0,
          swapsThisWeek: swapsThisWeek || 0,
          organizationName: org?.name || "Your Organization",
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Unable to load dashboard</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Team Members",
      value: stats.memberCount,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Departments",
      value: stats.departmentCount,
      icon: Briefcase,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Shifts This Week",
      value: stats.shiftsThisWeek,
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Swap Requests",
      value: stats.swapsThisWeek,
      icon: TrendingUp,
      color: "text-gold",
      bg: "bg-gold/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            {stats.organizationName}
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Organization Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/settings")}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} blur-3xl -z-10`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="text-white/10 group-hover:text-gold/20 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
              {card.label}
            </p>
            <h2 className="text-3xl font-black text-white">{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="glass rounded-[2.5rem] p-10 border-white/5">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-12 rounded-xl justify-start"
            onClick={() => router.push("/team")}
          >
            <Users className="w-5 h-5 mr-3" />
            Manage Team
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl justify-start"
            onClick={() => router.push("/shifts")}
          >
            <Clock className="w-5 h-5 mr-3" />
            View Shifts
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl justify-start"
            onClick={() => router.push("/analytics")}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
