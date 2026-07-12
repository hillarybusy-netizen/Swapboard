"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  departmentId?: string;
}

export function RealtimeNotifications({ userId, departmentId }: Props) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // Unique suffix prevents Supabase reusing a stale subscribed channel instance
    // across React StrictMode double-invocations or departmentId changes.
    const uid = crypto.randomUUID();

    // Listen to department-wide shift changes (for new available shifts and auto-starts)
    const deptShiftsChannel = departmentId 
      ? supabase.channel(`dept-shifts-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shifts",
            filter: `department_id=eq.${departmentId}`,
          },
          (payload) => {
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;

            if (payload.eventType === "INSERT") {
              if (!newRecord.assigned_to) {
                toast({
                  title: "New available shift posted",
                  description: `A new unassigned shift is available in your department.`,
                  className: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                });
                router.refresh();
              }
            } else if (payload.eventType === "UPDATE") {
              // Only alert if we aren't the assignee (the personal channel handles our own shifts)
              if (newRecord.assigned_to !== userId) {
                if (oldRecord.status === "not_started" && newRecord.status === "started" && !newRecord.assigned_to) {
                  toast({
                    title: "Available shift started",
                    description: "An unassigned shift has just started.",
                  });
                  router.refresh();
                }
              }
            }
          }
        )
        .subscribe()
      : null;

    // Listen to personal shift updates
    const personalShiftsChannel = supabase.channel(`personal-shifts-${uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `assigned_to=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast({
              title: "Shift Assigned",
              description: `You have been directly assigned a new shift.`,
              className: "bg-blue-500/10 border-blue-500/20 text-blue-400",
            });
            router.refresh();
          } else if (payload.eventType === "UPDATE") {
            const oldRecord = payload.old as any;
            const newRecord = payload.new as any;
            
            if (oldRecord.status !== newRecord.status) {
              if (oldRecord.status === "pending_approval_swap" && newRecord.status === "swapped") {
                toast({
                  title: "Shift swapped",
                  description: "Your swap request was approved and transferred.",
                  className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                });
              } else if (oldRecord.status === "up_for_swap" && newRecord.status === "not_started") {
                toast({
                  title: "Swap expired/cancelled",
                  description: "Your shift is no longer up for swap and has reverted to you.",
                  variant: "destructive",
                });
              } else if (oldRecord.status === "pending_approval_claim" && newRecord.status === "not_started") {
                toast({
                  title: "Shift claim declined",
                  description: "Your claim for the unassigned shift was declined.",
                  variant: "destructive",
                });
              } else if (oldRecord.status === "done_pending_approval" && newRecord.status === "done_manager_approved") {
                toast({
                  title: "Mark as done approved",
                  description: "Your manager has confirmed your completed shift.",
                  className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                });
              } else if (newRecord.status === "done_rejected") {
                toast({
                  title: "Shift Completion Rejected",
                  description: "Your manager rejected your shift completion. Check notes.",
                  variant: "destructive",
                });
              } else if (oldRecord.status === "started" && newRecord.status === "overdue_not_done") {
                toast({
                  title: "Shift overdue: please mark as done",
                  description: "Your shift has ended but isn't marked complete.",
                  className: "bg-orange-500/10 border-orange-500/20 text-orange-400",
                });
              } else if (oldRecord.status === "pending_approval_claim" && newRecord.status === "not_started" && newRecord.assigned_to === userId) {
                 toast({
                  title: "Shift claim approved",
                  description: "Your claim for the unassigned shift was approved.",
                  className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                });
              }
            }
            router.refresh();
          }
        }
      )
      .subscribe();

    // Listen for swap request updates
    const swapsChannel = departmentId 
      ? supabase.channel(`dept-swaps-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "swap_requests",
          },
          (payload) => {
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;

            if (payload.eventType === "INSERT" && newRecord.status === "pending" && newRecord.requester_id !== userId) {
              // Need to know if this swap is in our department. We assume it is if the user is in the same dept. 
              // We could verify by fetching, but for real-time simplicity we notify.
              toast({
                title: "New swap-eligible shift posted",
                description: "A colleague just posted a shift for swap.",
                className: "bg-purple-500/10 border-purple-500/20 text-purple-400",
              });
              router.refresh();
            } else if (payload.eventType === "UPDATE") {
              if (newRecord.requester_id === userId && oldRecord.status !== newRecord.status) {
                if (newRecord.status === "worker_accepted") {
                  toast({
                    title: "Cover Offered",
                    description: "Someone offered to cover your shift! Waiting for manager approval.",
                    className: "bg-gold/10 border-gold/20 text-gold",
                  });
                } else if (newRecord.status === "manager_approved") {
                  toast({
                    title: "Swap request approved",
                    description: "Your swap was approved by your manager.",
                    className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  });
                } else if (newRecord.status === "rejected") {
                  toast({
                    title: "Swap request declined",
                    description: "Your manager rejected the swap request.",
                    variant: "destructive",
                  });
                }
                router.refresh();
              }
            }
          }
        )
        .subscribe()
      : null;

    return () => {
      if (deptShiftsChannel) supabase.removeChannel(deptShiftsChannel);
      supabase.removeChannel(personalShiftsChannel);
      if (swapsChannel) supabase.removeChannel(swapsChannel);
    };
  }, [userId, departmentId, toast, router]);

  return null;
}
