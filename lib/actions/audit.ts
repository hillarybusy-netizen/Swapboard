import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function logAudit(
  organizationId: string,
  entityType: string,
  entityId: string,
  action: string,
  actorId: string | null,
  metadata: any = {}
) {
  const admin = createAdminClient();
  const { error } = await admin.from("audit_logs").insert({
    organization_id: organizationId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    actor_id: actorId,
    metadata,
  });

  if (error) {
    console.error("Failed to log audit event:", error);
  }
}
