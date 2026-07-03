"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth-helpers";
import { PLAN_LIMITS } from "@/lib/plans";
import { Plan } from "@/lib/database.types";
import { getStripe } from "@/lib/stripe";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

async function verifyStripeCheckoutSession(
  sessionId: string,
  expectedAmountCents: number,
  expectedOrgId: string,
  expectedPlanId: string
) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment could not be verified.");
  }

  if (session.amount_total !== expectedAmountCents) {
    throw new Error("Payment amount does not match the selected plan.");
  }

  if (session.metadata?.orgId !== expectedOrgId || session.metadata?.planId !== expectedPlanId) {
    throw new Error("Payment session does not match this request.");
  }

  return session;
}

export async function createCheckoutSession(orgId: string, planId: string) {
  const { user } = await requireManager(orgId);

  if (!PLAN_LIMITS[planId as Plan]) {
    throw new Error("Invalid plan selected.");
  }

  const planInfo = PLAN_LIMITS[planId as Plan];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `SwapBoard ${planInfo.label} Plan`,
            description: `Monthly subscription — ${planInfo.label}`,
          },
          unit_amount: planInfo.price * 100,
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    metadata: {
      orgId,
      planId,
    },
    success_url: `${appUrl}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/settings?tab=billing&checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session.");
  }

  return { url: session.url };
}

export async function completeCheckout(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment was not completed.");
  }

  const orgId = session.metadata?.orgId;
  const planId = session.metadata?.planId;
  if (!orgId || !planId) {
    throw new Error("Invalid checkout session.");
  }

  const { supabase } = await requireManager(orgId);
  const planInfo = PLAN_LIMITS[planId as Plan];
  if (!planInfo) {
    throw new Error("Invalid plan.");
  }

  if (session.amount_total !== planInfo.price * 100) {
    throw new Error("Payment amount does not match the selected plan.");
  }

  const { error } = await supabase
    .from("organizations")
    .update({ plan: planId as Plan })
    .eq("id", orgId);

  if (error) throw error;
  redirect("/dashboard?status=upgraded");
}

export async function updatePlan(orgId: string, plan: string, checkoutSessionId?: string) {
  const { supabase } = await requireManager(orgId);

  if (!PLAN_LIMITS[plan as Plan]) {
    throw new Error("Invalid plan selected.");
  }

  const planInfo = PLAN_LIMITS[plan as Plan];
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    throw new Error("Organization not found.");
  }

  const currentPrice = PLAN_LIMITS[org.plan as Plan].price;
  const targetPrice = planInfo.price;

  if (targetPrice > currentPrice && plan !== "trial") {
    if (!checkoutSessionId) {
      throw new Error("Payment is required for this plan change.");
    }
    await verifyStripeCheckoutSession(
      checkoutSessionId,
      planInfo.price * 100,
      orgId,
      plan
    );
  }

  const { error } = await supabase
    .from("organizations")
    .update({ plan: plan as Plan })
    .eq("id", orgId);

  if (error) throw error;
  redirect("/dashboard?status=upgraded");
}
