"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { WorkerRealtimeNotifications } from "./WorkerRealtimeNotifications";
import { ManagerRealtimeNotifications } from "./ManagerRealtimeNotifications";

export function RealtimeNotificationsProvider() {
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_role, department_ids")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserRole(profile.user_role);
          if (profile.department_ids) {
            setDepartmentIds(profile.department_ids);
          }
        }
      } catch (error) {
        console.error("Failed to load user role:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserRole();
  }, [supabase]);

  if (loading) return null;

  return (
    <>
      {userRole === "worker" && <WorkerRealtimeNotifications />}
      {userRole === "manager" && <ManagerRealtimeNotifications departmentIds={departmentIds} />}
    </>
  );
}
