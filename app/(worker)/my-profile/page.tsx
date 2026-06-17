import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import {
  User,
  Phone,
  Mail,
  AlertTriangle,
  Award,
  Bell,
  LogOut,
  Check,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CompletionField {
  label: string;
  done: boolean;
  icon: React.ElementType;
  tip: string;
}

function calcCompletion(profile: any): CompletionField[] {
  return [
    {
      label: "Full name",
      done: !!profile?.full_name,
      icon: User,
      tip: "Add your full name below",
    },
    {
      label: "Profile photo",
      done: !!profile?.avatar_url,
      icon: User,
      tip: "Upload a photo (ask your manager)",
    },
    {
      label: "Phone number",
      done: !!profile?.phone,
      icon: Phone,
      tip: "Add your phone number below",
    },
    {
      label: "Personal email",
      done: !!profile?.personal_email,
      icon: Mail,
      tip: "Add your personal email below",
    },
    {
      label: "Emergency contact name",
      done: !!profile?.emergency_contact_name,
      icon: AlertTriangle,
      tip: "Add emergency contact below",
    },
    {
      label: "Emergency contact phone",
      done: !!profile?.emergency_contact_phone,
      icon: Phone,
      tip: "Add emergency phone below",
    },
    {
      label: "Certifications",
      done:
        Array.isArray(profile?.certifications) &&
        profile.certifications.length > 0,
      icon: Award,
      tip: "Ask your manager to add certifications",
    },
    {
      label: "Notification preferences",
      done:
        !!profile?.notification_preferences &&
        typeof profile.notification_preferences === "object" &&
        Object.keys(profile.notification_preferences).length > 0,
      icon: Bell,
      tip: "Ask your manager to configure",
    },
  ];
}

export default async function MyProfilePage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const fields = calcCompletion(profile);
  const completedCount = fields.filter((f) => f.done).length;
  const pct = Math.round((completedCount / fields.length) * 100);
  const initials = getInitials(profile?.full_name);
  const orgName = (profile as any)?.organization?.name;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <h1 className="text-3xl font-black tracking-tight text-white">My Profile</h1>

      {/* Profile Hero Card */}
      <div className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-28 bg-gold/5 blur-3xl -z-10" />

        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/25 flex items-center justify-center text-gold text-2xl font-black shadow-xl shadow-gold/10">
              {initials}
            </div>
            {pct === 100 && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#050505] shadow-md">
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            {profile?.full_name ?? "Unnamed Worker"}
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
            {user.email}
          </p>
          {orgName && (
            <p className="text-[11px] font-bold text-gold/40 mt-1">{orgName}</p>
          )}

          {/* Role / Dept badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              {profile?.user_role ?? "worker"}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Completion Tracker */}
      <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">Profile Completion</p>
            <p className="text-[11px] text-white/30 font-medium mt-0.5">
              {completedCount} of {fields.length} fields complete
            </p>
          </div>
          <span
            className={cn(
              "text-2xl font-black",
              pct === 100 ? "text-emerald-400" : pct >= 50 ? "text-gold" : "text-white/50"
            )}
          >
            {pct}%
          </span>
        </div>

        {/* Segmented bar */}
        <div className="flex gap-1">
          {fields.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-700",
                i < completedCount ? "bg-gold" : "bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Checklist */}
        <div className="grid gap-2">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  field.done ? "bg-emerald-500/5" : "bg-white/3"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    field.done
                      ? "bg-emerald-500/20 border border-emerald-500/30"
                      : "bg-white/5 border border-white/10"
                  )}
                >
                  {field.done ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
                  ) : (
                    <X className="w-3 h-3 text-white/20" strokeWidth={3} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-[11px] font-bold",
                      field.done ? "text-white/50 line-through" : "text-white/70"
                    )}
                  >
                    {field.label}
                  </p>
                  {!field.done && (
                    <p className="text-[10px] text-white/25">{field.tip}</p>
                  )}
                </div>
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    field.done ? "text-emerald-400/40" : "text-white/15"
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Info (read-only fields) */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1">Account Info</h3>
        <div className="glass rounded-2xl border border-white/5 divide-y divide-white/5">
          {[
            { label: "Email", value: user.email },
            { label: "Role", value: profile?.user_role ? profile.user_role.charAt(0).toUpperCase() + profile.user_role.slice(1) : "Worker" },
            { label: "Timezone", value: (profile as any)?.timezone || "UTC" },
            { label: "Hourly Rate", value: profile?.hourly_rate ? `$${profile.hourly_rate}/hr` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm font-bold text-white/40">{label}</span>
              <span className="text-sm font-medium text-white">{value ?? "—"}</span>
            </div>
          ))}
          {Array.isArray(profile?.certifications) && profile.certifications.length > 0 && (
            <div className="flex items-start justify-between px-5 py-3.5">
              <span className="text-sm font-bold text-white/40">Certifications</span>
              <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                {profile.certifications.map((c: string) => (
                  <span
                    key={c}
                    className="text-[9px] font-black text-gold bg-gold/10 border border-gold/15 px-2 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1">
          Edit Profile
        </h3>
        <ProfileEditForm
          profile={{
            full_name: profile?.full_name ?? null,
            phone: profile?.phone ?? null,
            personal_email: profile?.personal_email ?? null,
            emergency_contact_name: profile?.emergency_contact_name ?? null,
            emergency_contact_phone: profile?.emergency_contact_phone ?? null,
          }}
        />
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <form action={signOut}>
          <button
            type="submit"
            className="
              w-full glass rounded-2xl p-5 flex items-center justify-center gap-2.5
              border border-red-500/15 bg-red-500/5
              hover:bg-red-500/10 hover:border-red-500/30
              active:scale-[0.98] transition-all duration-200 group
              text-red-400/80 hover:text-red-400
            "
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
