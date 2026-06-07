import { getAllUsers } from "@/lib/actions/admin";
import { AdminUsersList } from "@/components/admin/AdminUsersList";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await getAllUsers();

  return (
    <div className="space-y-12">
      <div className="px-1">
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">User Directory</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Managing <span className="text-gold/60">{users.length} Users</span> across all organizations
        </p>
      </div>
      <AdminUsersList users={users} />
    </div>
  );
}
