"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export function ManagerRealtimeNotifications({ departmentIds }: { departmentIds: string[] }) {
  const supabase = createClient();

  useEffect(() => {
    if (!departmentIds || departmentIds.length === 0) return;

    // Subscribe to department swaps
    const swapChannel = supabase
      .channel("manager-swaps")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "swap_requests",
        },
        async (payload) => {
          const swap = payload.new as any;

          if (swap.status === "worker_accepted") {
            // New cover offered - needs manager approval
            const { data: requester } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", swap.requester_id)
              .single();

            const { data: coverWorker } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", swap.covering_worker_id)
              .single();

            const { data: shift } = await supabase
              .from("shifts")
              .select("title")
              .eq("id", swap.shift_id)
              .single();

            toast({
              title: "Swap Request Pending Approval ⏳",
              description: `${coverWorker?.full_name} offered to cover "${shift?.title}" for ${requester?.full_name}.`,
              className: "bg-blue-500/20 border-blue-500/50 text-blue-400",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to shift claim approvals
    const shiftChannel = supabase
      .channel("manager-shifts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shifts",
        },
        async (payload) => {
          const shift = payload.new as any;

          if (shift.status === "pending_approval_claim") {
            const { data: worker } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", shift.assigned_to)
              .single();

            toast({
              title: "Shift Claim Pending Approval ⏳",
              description: `${worker?.full_name} claimed "${shift.title}". Please review.`,
              className: "bg-blue-500/20 border-blue-500/50 text-blue-400",
            });
          } else if (shift.status === "done_pending_approval") {
            const { data: worker } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", shift.assigned_to)
              .single();

            toast({
              title: "Shift Completion Pending Approval ⏳",
              description: `${worker?.full_name} marked "${shift.title}" as complete.`,
              className: "bg-blue-500/20 border-blue-500/50 text-blue-400",
            });
          }
        }
      )
      .subscribe();

    return () => {
      swapChannel.unsubscribe();
      shiftChannel.unsubscribe();
    };
  }, [supabase, departmentIds]);

  return null; // This component only handles side effects
}
