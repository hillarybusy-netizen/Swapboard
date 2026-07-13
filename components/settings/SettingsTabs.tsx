"use client";
import { Suspense, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgSettings } from "@/components/settings/OrgSettings";
import { DepartmentEditor } from "@/components/settings/DepartmentEditor";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { InviteTeam } from "@/components/settings/InviteTeam";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PendingInvitesSettings } from "@/components/settings/PendingInvitesSettings";
import { cn } from "@/lib/utils";
import type { Organization, Profile, Json } from "@/lib/database.types";

interface PendingInvite {
  id: string;
  email: string | null;
  user_role: string;
  created_at: string;
}

interface SettingsTabsProps {
  defaultTab: string;
  expired: boolean;
  org: Organization | null;
  userId: string;
  userEmail: string | undefined;
  profile: Profile;
  departments: any[];
  orgId: string;
  profileCount: number;
  pendingInvites: PendingInvite[];
}

const TABS = [
  { value: "org", label: "Organization" },
  { value: "account", label: "Account" },
  { value: "departments", label: "Departments" },
  { value: "team", label: "Invite Team" },
  { value: "invites", label: "Invitations" },
  { value: "notifications", label: "Notifications" },
  { value: "billing", label: "Billing" },
] as const;

const EXPIRED_DISABLED = new Set(["org", "departments", "team", "invites"]);

export function SettingsTabs({
  defaultTab,
  expired,
  org,
  userId,
  userEmail,
  profile,
  departments,
  orgId,
  profileCount,
  pendingInvites,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="px-1 md:px-2">
      <div className="-mx-1 mb-8 overflow-x-auto px-1 pb-2 no-scrollbar md:mb-10">
        <TabsList className="flex h-11 w-max min-w-full gap-1 rounded-full border border-white/5 bg-white/5 p-1 md:h-12 md:min-w-0">
          {TABS.map((tab) => {
            const isDisabled = expired && EXPIRED_DISABLED.has(tab.value);
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={isDisabled}
                className={cn(
                  "h-full shrink-0 whitespace-nowrap rounded-full px-4 text-[9px] font-black uppercase tracking-widest text-white/40 transition-all data-[state=active]:bg-gold data-[state=active]:text-[#050505] data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 md:px-6 md:text-[10px]",
                  isDisabled && "pointer-events-none cursor-not-allowed opacity-20"
                )}
              >
                {tab.label}
                {tab.value === "invites" && pendingInvites.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold/30 text-[8px] font-black text-gold">
                    {pendingInvites.length}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -z-10" />

        {activeTab === "org" && (
          <OrgSettings
            org={org}
            userId={userId}
            profileCount={profileCount}
            departmentCount={departments.length}
          />
        )}
        {activeTab === "account" && (
          <AccountSettings profile={profile} userEmail={userEmail} />
        )}
        {activeTab === "departments" && (
          <DepartmentEditor departments={departments} orgId={orgId} org={org} />
        )}
        {activeTab === "team" && (
          <InviteTeam orgId={orgId} departments={departments} org={org} profileCount={profileCount} />
        )}
        {activeTab === "invites" && (
          <PendingInvitesSettings invites={pendingInvites} />
        )}
        {activeTab === "notifications" && (
          <NotificationSettings preferences={profile.notification_preferences as Json} />
        )}
        {activeTab === "billing" && (
          <Suspense fallback={null}>
            <BillingSettings org={org} />
          </Suspense>
        )}
      </div>
    </Tabs>
  );
}
