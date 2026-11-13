import { getOrganizations } from "@/lib/actions/admin";
import { AdminOrgsList } from "@/components/admin/AdminOrgsList";

export const dynamic = "force-dynamic";

export default async function AdminOrganizations() {
  const orgs = await getOrganizations();

  return (
    <div className="space-y-12">
      <div className="px-1">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Organization Manager</h1>
        <p className="text-white/55 text-[11px] font-semibold uppercase tracking-wider">
          Tracking <span className="text-gold/60">{orgs.length} Organizations</span> on Swapboard
        </p>
      </div>
      <AdminOrgsList orgs={orgs} />
    </div>
  );
}
