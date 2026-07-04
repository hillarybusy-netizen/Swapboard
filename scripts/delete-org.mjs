/**
 * Targeted org deletion script.
 * Deletes one org (by name match) and ALL its associated data.
 * Run with: node scripts/delete-org.mjs
 */

const SUPABASE_URL = "https://kymhjoaddfglyyfyrpri.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bWhqb2FkZGZnbHl5ZnlycHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEyMTQ0MiwiZXhwIjoyMDg2Njk3NDQyfQ._TJxp9b8vDq57tTSgeWNAyFVWt0bZJpxnd_rYkjIuCI";

const headers = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function query(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers,
    ...options,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : [];
}

async function del(table, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`DELETE ${table}: ${res.status} ${text}`);
  console.log(`  ✓ Deleted from ${table}`);
}

async function deleteAuthUser(userId) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`  ⚠ Could not delete auth user ${userId}: ${text}`);
  } else {
    console.log(`  ✓ Deleted auth user ${userId}`);
  }
}

async function run() {
  // 1. Find the organisation
  console.log("\n🔍 Looking up organisation...\n");
  const orgs = await query("organizations?name=ilike.*life*live*&select=id,name,plan");

  if (orgs.length === 0) {
    // Try a broader search
    const all = await query("organizations?select=id,name,plan&order=created_at.desc");
    console.log("No exact match. All organisations found:");
    all.forEach(o => console.log(`  - ${o.name} (${o.id}) [${o.plan}]`));
    console.log("\nUpdate the script's name filter and re-run.");
    return;
  }

  if (orgs.length > 1) {
    console.log("Multiple matches found — please narrow the filter:");
    orgs.forEach(o => console.log(`  - ${o.name} (${o.id})`));
    return;
  }

  const org = orgs[0];
  console.log(`✅ Found org: "${org.name}" (id: ${org.id}, plan: ${org.plan})\n`);
  console.log("⚠️  About to permanently delete ALL data for this org in 5 seconds...");
  console.log("    Press Ctrl+C to cancel.\n");
  await new Promise(r => setTimeout(r, 5000));

  const orgId = org.id;

  // 2. Collect profile IDs (to delete auth users too)
  console.log("📋 Collecting profile user IDs...");
  const profiles = await query(`profiles?organization_id=eq.${orgId}&select=id`);
  const userIds = profiles.map(p => p.id);
  console.log(`   Found ${userIds.length} user profiles\n`);

  // 3. Delete in dependency order
  console.log("🗑️  Deleting org data...\n");

  await del("swap_requests",     `organization_id=eq.${orgId}`);
  await del("shifts",            `organization_id=eq.${orgId}`);
  await del("analytics_events",  `organization_id=eq.${orgId}`);
  await del("feedback",          `organization_id=eq.${orgId}`);
  await del("invitations",       `organization_id=eq.${orgId}`);
  await del("audit_logs",        `organization_id=eq.${orgId}`);
  await del("profiles",          `organization_id=eq.${orgId}`);
  await del("roles",             `organization_id=eq.${orgId}`);
  await del("departments",       `organization_id=eq.${orgId}`);
  await del("organizations",     `id=eq.${orgId}`);

  // 4. Delete auth users
  console.log("\n👤 Deleting Supabase Auth accounts...\n");
  for (const uid of userIds) {
    await deleteAuthUser(uid);
  }

  console.log("\n✅ Done! Organisation and all its data have been permanently deleted.\n");
}

run().catch(err => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
