"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createShift(formData: {
  organization_id: string;
  department_id: string;
  role_id?: string;
  assigned_to?: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("shifts")
    .insert({
      ...formData,
      created_by: user.id,
    });

  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/shifts");

  return { success: true };
}
