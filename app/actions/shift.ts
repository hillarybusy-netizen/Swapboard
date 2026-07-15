"use server";

import { requireManager } from "@/lib/auth-helpers";
import { canManagerAccessDepartment } from "@/lib/managers";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";
import { triggerShiftAssigned, triggerGeneralShiftPosted } from "@/lib/actions/notification-triggers";
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
  const { supabase, user, profile } = await requireManager(input.organization_id);
  const startTime = new Date(input.start_time);
  const endTime = new Date(input.end_time);

  if (!input.title.trim()) throw new Error("A shift title is required.");
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || endTime <= startTime) {
    throw new Error("The shift end time must be after its start time.");
  }

  // General shifts use a null department_id and are always open for workers to
  // claim. A normal department shift may still be unassigned, but it remains
  // visible only to eligible workers in that department.
  let departmentId = input.department_id;
  if (departmentId) {
    const { data: department, error: departmentError } = await supabase
      .from("departments")
      .select("name")
      .eq("id", departmentId)
      .eq("organization_id", input.organization_id)
      .single();
    if (departmentError || !department) throw new Error("The selected department could not be found.");
    if (department.name.toLowerCase() === "general") departmentId = null;
  }
  if (profile.user_role === "manager" && !canManagerAccessDepartment(profile, departmentId)) {
    throw new Error("You can only create shifts within your assigned departments.");
  }
  if (!departmentId && input.assigned_to) {
    throw new Error("General shifts must be left open for workers to claim.");
  }

  if (input.assigned_to) {
    const { data: assignee, error: assigneeError } = await supabase
      .from("profiles")
      .select("organization_id, department_id, user_role, is_active")
      .eq("id", input.assigned_to)
      .single();

    if (
      assigneeError ||
      !assignee ||
      assignee.organization_id !== input.organization_id ||
      assignee.user_role !== "worker" ||
      !assignee.is_active ||
      assignee.department_id !== departmentId
    ) {
      throw new Error("The selected worker must be active and assigned to this shift's department.");
    }
  }

  // Determine shift status based on assignment
  // Unassigned shifts are "not_started", assigned shifts are also "not_started"
  const status = "not_started";

  const { data: shift, error } = await supabase
    .from("shifts")
    .insert({
      organization_id: input.organization_id,
      title: input.title,
      department_id: departmentId,
      assigned_to: input.assigned_to,
      start_time: input.start_time,
      end_time: input.end_time,
      notes: input.notes,
      status,
      created_by: user.id,
    })
    .select("*, department:departments(name)")
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
  } else if (!departmentId) {
    // General shifts are organization-wide open shifts, so notify every worker.
    await triggerGeneralShiftPosted(shift.id, input.organization_id);
  }

  revalidatePath("/shifts");
  revalidatePath("/my-shifts");
  revalidatePath("/dashboard");

  return shift;
}
