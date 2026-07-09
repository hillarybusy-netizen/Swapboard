"use server";

import { requireOrgAdmin } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { formatError } from "@/lib/errors";

export async function deleteOrganizationAction(orgId: string) {
  try {
    // 1. Authenticate user and verify org admin privileges
    await requireOrgAdmin(orgId);

    // 2. Instantiate Supabase admin client (service role)
    const adminClient = createAdminClient();

    // 3. Find all users in the organization
    const { data: profiles, error: fetchError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("organization_id", orgId);

    if (fetchError) {
      throw new Error(`Failed to fetch organization profiles: ${fetchError.message}`);
    }

    // 4. Delete every user from Auth. This cascades to delete their profile.
    if (profiles && profiles.length > 0) {
      const deletePromises = profiles.map(profile => adminClient.auth.admin.deleteUser(profile.id));
      const results = await Promise.allSettled(deletePromises);
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to delete user ${profiles[index].id}:`, result.reason);
        }
      });
    }

    // 5. Delete the organization itself. 
    // This will cascade to delete departments, shifts, swap requests, etc.
    const { error: deleteOrgError } = await adminClient
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (deleteOrgError) {
      throw new Error(`Failed to delete organization: ${deleteOrgError.message}`);
    }

    // Revalidate paths just in case, though the active session is already dead.
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    console.error("deleteOrganizationAction error:", err);
    return { success: false, error: formatError(err.message) };
  }
}
