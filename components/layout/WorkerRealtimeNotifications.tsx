"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/actions/notifications";

export function WorkerRealtimeNotifications() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to personal shifts
    const shiftChannel = supabase
      .channel("personal-shifts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
        },
        async (payload) => {
          const shift = payload.new as any;

          if (payload.eventType === "UPDATE") {
            const statusMessages: Record<string, { title: string; message: string; className: string }> = {
              swapped: {
                title: "Swap Approved ✅",
                message: `Your swap for "${shift.title}" has been approved!`,
                className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
              },
              pending_approval_claim: {
                title: "Claim Pending Review",
                message: `Your claim for "${shift.title}" is awaiting manager approval.`,
                className: "bg-blue-500/20 border-blue-500/50 text-blue-400",
              },
              done_manager_approved: {
                title: "Completion Approved ✅",
                message: `Your completion for "${shift.title}" has been approved.`,
                className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
              },
              done_rejected: {
                title: "Completion Needs Review",
                message: `Your completion for "${shift.title}" needs revision.`,
                className: "bg-orange-500/20 border-orange-500/50 text-orange-400",
              },
            };

            const msgData = statusMessages[shift.status];
            if (msgData) {
              toast({
                title: msgData.title,
                description: msgData.message,
                className: msgData.className,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to swap requests
    const swapChannel = supabase
      .channel("personal-swaps")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "swap_requests",
        },
        (payload) => {
          const swap = payload.new as any;

          const statusMessages: Record<string, { title: string; message: string; className: string }> = {
            swap_approved: {
              title: "Swap Approved ✅",
              message: "Your swap has been approved by your manager!",
              className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
            },
            rejected: {
              title: "Swap Declined",
              message: "Your swap request has been declined.",
              className: "bg-red-500/20 border-red-500/50 text-red-400",
            },
          };

          const msgData = statusMessages[swap.status];
          if (msgData) {
            toast({
              title: msgData.title,
              description: msgData.message,
              className: msgData.className,
            });
          }
        }
      )
      .subscribe();

    return () => {
      shiftChannel.unsubscribe();
      swapChannel.unsubscribe();
    };
  }, [supabase, router]);

  return null; // This component only handles side effects
}
