import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check user role — must be org_admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // super_admin should use /super-admin
  if (profile.user_role === "super_admin") redirect("/super-admin");

  // Only org_admin can access /admin
  if (profile.user_role !== "org_admin") redirect("/dashboard");

  if (!profile.organization_id) redirect("/onboarding/industry");

  const org = (profile as any)?.organization ?? null;

  return (
    <div className="min-h-screen bg-[#050505] flex relative">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />

      <AdminSidebar org={org} profile={profile as any} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-transparent">
          <div className="flex items-center justify-end px-4 md:px-10 py-2">
            <ProfileDropdown profile={profile as any} />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:p-10 pb-32 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
