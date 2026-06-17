"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2, User, Phone, Mail, AlertTriangle } from "lucide-react";

interface ProfileEditFormProps {
  profile: {
    full_name: string | null;
    phone: string | null;
    personal_email: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
  };
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await updateProfile(formData);
        toast({
          title: "Profile updated ✓",
          description: "Your changes have been saved.",
          className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Info */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">
          Personal Information
        </h3>

        <div className="glass rounded-2xl p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Full Name
            </label>
            <input
              name="full_name"
              defaultValue={profile.full_name ?? ""}
              placeholder="Your full name"
              className="
                w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-sm text-white placeholder:text-white/20 font-medium
                focus:outline-none focus:border-gold/40 focus:bg-white/8
                transition-all duration-200
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3 h-3" /> Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              placeholder="+1 (555) 000-0000"
              className="
                w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-sm text-white placeholder:text-white/20 font-medium
                focus:outline-none focus:border-gold/40 focus:bg-white/8
                transition-all duration-200
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3 h-3" /> Personal Email
            </label>
            <input
              name="personal_email"
              type="email"
              defaultValue={profile.personal_email ?? ""}
              placeholder="your@email.com"
              className="
                w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-sm text-white placeholder:text-white/20 font-medium
                focus:outline-none focus:border-gold/40 focus:bg-white/8
                transition-all duration-200
              "
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-orange-400/60" /> Emergency Contact
        </h3>

        <div className="glass rounded-2xl p-4 space-y-4 border border-orange-500/10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Contact Name
            </label>
            <input
              name="emergency_contact_name"
              defaultValue={profile.emergency_contact_name ?? ""}
              placeholder="Emergency contact's full name"
              className="
                w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-sm text-white placeholder:text-white/20 font-medium
                focus:outline-none focus:border-orange-400/40 focus:bg-white/8
                transition-all duration-200
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3 h-3" /> Contact Phone
            </label>
            <input
              name="emergency_contact_phone"
              type="tel"
              defaultValue={profile.emergency_contact_phone ?? ""}
              placeholder="+1 (555) 000-0000"
              className="
                w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-sm text-white placeholder:text-white/20 font-medium
                focus:outline-none focus:border-orange-400/40 focus:bg-white/8
                transition-all duration-200
              "
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="
          w-full btn-gold h-12 rounded-2xl flex items-center justify-center gap-2.5
          text-[11px] font-black uppercase tracking-widest text-[#050505]
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          "✓ Saved!"
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </button>
    </form>
  );
}
