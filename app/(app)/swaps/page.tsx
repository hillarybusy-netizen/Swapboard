import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { SwapsTabs } from "@/components/swaps/SwapsTabs";

export const dynamic = "force-dynamic";

export default async function SwapsPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const supabase = await createClient();

  // Scope queries for Manager
  const isManager = profile?.user_role === "manager";
  const managerDeptIds = profile?.department_ids || [];

  let query = supabase
    .from("swap_requests")
    .select(`
      *,
      shift:shifts(*, department:departments(id, name, color)),
      requester:profiles!requester_id(id, full_name, email),
      covering_worker:profiles!covering_worker_id(id, full_name)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const { data: allSwapsData, error: swapsError } = await query;
  
  let allSwaps = (allSwapsData ?? []) as any[];

  if (isManager && managerDeptIds.length > 0) {
    allSwaps = allSwaps.filter(s =>
      managerDeptIds.includes(s.shift?.department_id) || s.shift?.department_id === null
    );
  }
  const pending = allSwaps.filter((s) => s.status === "pending" || s.status === "worker_accepted");
  const history = allSwaps.filter((s) => ["manager_approved", "rejected", "cancelled"].includes(s.status));

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Swap Requests</h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
            Coordination History · <span className="text-gold/60">{allSwaps.length} Total Requests</span>
          </p>
        </div>
      </div>

      <SwapsTabs defaultTab="pending" pending={pending} history={history} />
    </div>
  );
}
