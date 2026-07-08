"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateProfile, updateUserTimezone } from "@/lib/actions/profile";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/errors";
import { COMMON_TIMEZONES } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock, Mail } from "lucide-react";
import type { Profile } from "@/lib/database.types";

interface AccountSettingsProps {
  profile: Profile;
  userEmail?: string;
}

export function AccountSettings({ profile, userEmail }: AccountSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [timezone, setTimezone] = useState(profile.timezone || "UTC");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateProfile(formData);
        if (timezone !== profile.timezone) {
          await updateUserTimezone(timezone);
        }
        toast({ title: "Account updated", variant: "success" });
      } catch (err) {
        toast({ title: "Error", description: catchError(err), variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Your Account</h2>
        <p className="text-sm text-white/40 mt-1">Manage your personal profile and login details</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/20 flex items-center justify-center text-gold font-black">
            {profile.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{profile.full_name ?? "Admin"}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gold/70">{profile.user_role}</p>
          </div>
        </div>
        {userEmail && (
          <div className="flex items-center gap-2 text-sm text-white/50 pt-1">
            <Mail className="w-4 h-4 shrink-0" />
            <span>{userEmail}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile.full_name ?? ""}
              placeholder="Your full name"
              className="h-11 bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              placeholder="+1 (555) 000-0000"
              className="h-11 bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="personal_email">Personal email</Label>
            <Input
              id="personal_email"
              name="personal_email"
              type="email"
              defaultValue={profile.personal_email ?? ""}
              placeholder="you@email.com"
              className="h-11 bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#050505] border-white/10 max-h-60">
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact_name">Emergency contact name</Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              defaultValue={profile.emergency_contact_name ?? ""}
              placeholder="Contact name"
              className="h-11 bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact_phone">Emergency contact phone</Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              defaultValue={profile.emergency_contact_phone ?? ""}
              placeholder="+1 (555) 000-0000"
              className="h-11 bg-white/5 border-white/10 rounded-xl"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="btn-gold rounded-full px-8 h-11 text-xs font-black uppercase tracking-widest"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Save Account
        </Button>
      </form>

      <div className="glass rounded-2xl border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">Password</p>
          <p className="text-xs text-white/40 mt-0.5">Reset your password via email</p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          Change password
        </Link>
      </div>
    </div>
  );
}
