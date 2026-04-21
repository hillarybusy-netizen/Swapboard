"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updatePlan(orgId: string, plan: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ 
      plan: plan as any,
      // If moving away from trial, we could theoretically clear trial_ends_at or leave for record
    })
    .eq("id", orgId);
    
  if (error) throw error;
  redirect("/dashboard?status=upgraded");
}
