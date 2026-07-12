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
          .select("user_role, manager_type, department_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserRole(profile.user_role);

          if (profile.user_role === "org_admin" || profile.user_role === "super_admin") {
            // Admins get a wildcard so ManagerRealtimeNotifications doesn't bail
            setDepartmentIds(["*"]);
          } else if (profile.user_role === "manager") {
            if (profile.manager_type === "department" && profile.department_id) {
              setDepartmentIds([profile.department_id]);
            } else {
              // General manager — sees all departments
              setDepartmentIds(["*"]);
            }
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
      {(userRole === "manager" || userRole === "org_admin" || userRole === "super_admin") && (
        <ManagerRealtimeNotifications departmentIds={departmentIds} />
      )}
    </>
  );
}
