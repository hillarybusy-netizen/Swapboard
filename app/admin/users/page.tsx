import { getAllUsers } from "@/lib/actions/admin";
import { AdminUsersList } from "@/components/admin/AdminUsersList";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await getAllUsers();

  return (
    <div className="space-y-12">
      <div className="px-1">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">User Directory</h1>
        <p className="text-white/55 text-[11px] font-semibold uppercase tracking-wider">
          Managing <span className="text-gold/60">{users.length} Users</span> across all organizations
        </p>
      </div>
      <AdminUsersList users={users} />
    </div>
  );
}
