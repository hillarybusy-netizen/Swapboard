"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth-helpers";
import { PLAN_LIMITS } from "@/lib/plans";
import { Plan } from "@/lib/database.types";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function verifyPaystackPayment(reference: string, expectedAmountCents: number) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Payment verification is not configured.");
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });

  const json = await res.json();
  if (!json.status || json.data?.status !== "success") {
    throw new Error("Payment could not be verified.");
  }

  if (json.data.amount !== expectedAmountCents) {
    throw new Error("Payment amount does not match the selected plan.");
  }

  return json.data;
}

export async function updatePlan(orgId: string, plan: string, paymentReference?: string) {
  const { supabase } = await requireManager(orgId);

  if (!PLAN_LIMITS[plan as Plan]) {
    throw new Error("Invalid plan selected.");
  }

  const planInfo = PLAN_LIMITS[plan as Plan];

  if (plan !== "trial") {
    if (!paymentReference) {
      throw new Error("Payment reference is required.");
    }
    await verifyPaystackPayment(paymentReference, planInfo.price * 100);
  }

  const { error } = await supabase
    .from("organizations")
    .update({ plan: plan as Plan })
    .eq("id", orgId);

  if (error) throw error;
  redirect("/dashboard?status=upgraded");
}
