"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";
import { triggerShiftAssigned } from "@/lib/actions/notification-triggers";
import { formatError } from "@/lib/errors";

interface CreateShiftInput {
  organization_id: string;
  title: string;
  department_id: string | null;
  assigned_to: string | null;
  start_time: string;
  end_time: string;
  notes: string | null;
}

export async function createShift(input: CreateShiftInput) {
  const { user } = await requireUser();
  const admin = createAdminClient();

  // Determine shift status based on assignment
  // Unassigned shifts are "not_started", assigned shifts are also "not_started"
  const status = "not_started";

  const { data: shift, error } = await admin
    .from("shifts")
    .insert({
      organization_id: input.organization_id,
      title: input.title,
      department_id: input.department_id,
      assigned_to: input.assigned_to,
      start_time: input.start_time,
      end_time: input.end_time,
      notes: input.notes,
      status,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(formatError(error.message));
  }

  // Log audit
  await logAudit(
    input.organization_id,
    "shift",
    shift.id,
    "shift_created",
    user.id,
    { title: input.title, assigned_to: input.assigned_to }
  );

  // Trigger notification if assigned
  if (input.assigned_to) {
    const startDate = new Date(input.start_time);
    const endDate = new Date(input.end_time);
    const dateStr = startDate.toLocaleDateString();
    const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    await triggerShiftAssigned(shift.id, input.assigned_to, input.organization_id);
  }

  revalidatePath("/shifts");
  revalidatePath("/my-shifts");
  revalidatePath("/dashboard");

  return shift;
}
