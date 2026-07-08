"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferences } from "@/lib/actions/profile";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Mail } from "lucide-react";
import type { Json } from "@/lib/database.types";

function parsePrefs(prefs: Json | null) {
  const p = (prefs as Record<string, unknown>) || {};
  const emailPref = p.email;
  const emailImmediate =
    emailPref === false
      ? false
      : typeof emailPref === "object" && emailPref !== null
        ? (emailPref as Record<string, unknown>).immediate !== false
        : true;
  const emailDigest =
    typeof emailPref === "object" && emailPref !== null
      ? (emailPref as Record<string, unknown>).digest !== false
      : true;
  const inApp = p.in_app !== false;
  return { emailImmediate, emailDigest, inApp };
}

export function NotificationSettings({ preferences }: { preferences: Json | null }) {
  const initial = parsePrefs(preferences);
  const [inApp, setInApp] = useState(initial.inApp);
  const [emailImmediate, setEmailImmediate] = useState(initial.emailImmediate);
  const [emailDigest, setEmailDigest] = useState(initial.emailDigest);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      try {
        await updateNotificationPreferences({
          in_app: inApp,
          email_immediate: emailImmediate,
          email_digest: emailDigest,
        });
        toast({ title: "Notification preferences saved", variant: "success" });
      } catch (err) {
        toast({ title: "Error", description: catchError(err), variant: "destructive" });
      }
    });
  }

  const toggles = [
    {
      id: "in_app",
      label: "In-app notifications",
      description: "Show alerts inside SwapBoard when shifts and swaps update",
      icon: Bell,
      checked: inApp,
      onChange: setInApp,
    },
    {
      id: "email_immediate",
      label: "Instant email alerts",
      description: "Get an email right away for important shift and swap events",
      icon: Mail,
      checked: emailImmediate,
      onChange: setEmailImmediate,
    },
    {
      id: "email_digest",
      label: "Daily email digest",
      description: "Receive a summary of pending approvals and upcoming shifts",
      icon: Mail,
      checked: emailDigest,
      onChange: setEmailDigest,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Notifications</h2>
        <p className="text-sm text-white/40 mt-1">Control how you receive updates about your workspace</p>
      </div>

      <div className="space-y-3">
        {toggles.map((toggle) => (
          <label
            key={toggle.id}
            className="flex items-start gap-4 glass rounded-2xl border border-white/5 p-5 cursor-pointer hover:border-gold/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <toggle.icon className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{toggle.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{toggle.description}</p>
            </div>
            <input
              type="checkbox"
              checked={toggle.checked}
              onChange={(e) => toggle.onChange(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-black/20 accent-gold cursor-pointer"
            />
          </label>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="btn-gold rounded-full px-8 h-11 text-xs font-black uppercase tracking-widest"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Save Preferences
      </Button>
    </div>
  );
}
