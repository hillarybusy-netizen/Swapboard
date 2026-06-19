import { createAdminClient } from "@/lib/supabase/admin";

async function clearDatabase() {
  const admin = createAdminClient();

  console.log("🧹 Starting database cleanup...\n");

  try {
    // Delete in order of dependencies (child tables first)

    console.log("Deleting swap_requests...");
    const { error: swapError } = await admin.from("swap_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (swapError) throw swapError;

    console.log("Deleting shifts...");
    const { error: shiftsError } = await admin.from("shifts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (shiftsError) throw shiftsError;

    console.log("Deleting analytics_events...");
    const { error: analyticsError } = await admin.from("analytics_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (analyticsError) throw analyticsError;

    console.log("Deleting feedback...");
    const { error: feedbackError } = await admin.from("feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (feedbackError) throw feedbackError;

    console.log("Deleting onboarding_progress...");
    const { error: onboardingError } = await admin.from("onboarding_progress").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (onboardingError) throw onboardingError;

    console.log("Deleting invitations...");
    const { error: invitationsError } = await admin.from("invitations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (invitationsError) throw invitationsError;

    console.log("Deleting audit_logs...");
    const { error: auditError } = await admin.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (auditError) throw auditError;

    console.log("Deleting profiles...");
    const { error: profilesError } = await admin.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (profilesError) throw profilesError;

    console.log("Deleting departments...");
    const { error: deptError } = await admin.from("departments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (deptError) throw deptError;

    console.log("Deleting organizations...");
    const { error: orgError } = await admin.from("organizations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (orgError) throw orgError;

    console.log("\n✅ Database cleared successfully!\n");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
