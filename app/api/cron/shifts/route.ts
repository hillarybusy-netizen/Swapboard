import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/actions/audit";
import { sendShiftDoneReminderEmail } from "@/lib/email";

// Called every 5 minutes by Vercel Cron (see vercel.json)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const results = { started: 0, overdue: 0, emailsSent: 0 };

  // 1. Auto-Start assigned shifts past their start_time
  const { data: shiftsToStart } = await admin
    .from("shifts")
    .select("id, organization_id")
    .eq("status", "not_started")
    .not("assigned_to", "is", null)
    .lte("start_time", now.toISOString());

  if (shiftsToStart?.length) {
    await admin
      .from("shifts")
      .update({ status: "started" })
      .in("id", shiftsToStart.map((s) => s.id));

    for (const shift of shiftsToStart) {
      await logAudit(shift.organization_id, "shift", shift.id, "auto_started", null);
    }
    results.started = shiftsToStart.length;
  }

  // 2. Grace period: mark started shifts overdue 5 mins after end_time
  const graceDeadline = new Date(now.getTime() - 5 * 60_000);
  const { data: shiftsToOverdue } = await admin
    .from("shifts")
    .select("id, organization_id, title, end_time, profile:profiles!shifts_assigned_to_fkey(full_name, email)")
    .eq("status", "started")
    .lte("end_time", graceDeadline.toISOString());

  if (shiftsToOverdue?.length) {
    await admin
      .from("shifts")
      .update({ status: "overdue_not_done" })
      .in("id", shiftsToOverdue.map((s) => s.id));

    for (const shift of shiftsToOverdue as any[]) {
      await logAudit(shift.organization_id, "shift", shift.id, "marked_overdue", null);

      // Send email reminder to worker
      const worker = shift.profile;
      if (worker?.email) {
        await sendShiftDoneReminderEmail(worker.email, worker.full_name, shift.title);
        results.emailsSent++;
      }
    }
    results.overdue = shiftsToOverdue.length;
  }

  return NextResponse.json({ success: true, ...results });
}
