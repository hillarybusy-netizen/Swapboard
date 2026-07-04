"use client";
import { Suspense, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgSettings } from "@/components/settings/OrgSettings";
import { DepartmentEditor } from "@/components/settings/DepartmentEditor";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { InviteTeam } from "@/components/settings/InviteTeam";
import { cn } from "@/lib/utils";
import type { Organization } from "@/lib/database.types";

interface SettingsTabsProps {
  defaultTab: string;
  expired: boolean;
  org: Organization | null;
  userId: string;
  userEmail: string | undefined;
  departments: any[];
  orgId: string;
  profileCount: number;
}

const TABS = [
  { value: "org", label: "Organization" },
  { value: "departments", label: "Departments" },
  { value: "team", label: "Invite Team" },
  { value: "billing", label: "Billing" },
] as const;

export function SettingsTabs({
  defaultTab,
  expired,
  org,
  userId,
  userEmail,
  departments,
  orgId,
  profileCount,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="px-1 md:px-2">
      <TabsList className="bg-white/5 p-1 rounded-full border border-white/5 h-11 md:h-12 flex gap-1 w-full md:w-fit mb-8 md:mb-10 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isDisabled = expired && tab.value !== "billing";
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={isDisabled}
              className={cn(
                "rounded-full px-4 md:px-6 data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 transition-all h-full whitespace-nowrap flex-1 md:flex-none",
                isDisabled && "opacity-20 cursor-not-allowed pointer-events-none"
              )}
            >
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -z-10" />

        {activeTab === "org" && <OrgSettings org={org} userId={userId} />}
        {activeTab === "departments" && (
          <DepartmentEditor departments={departments} orgId={orgId} org={org} />
        )}
        {activeTab === "team" && (
          <InviteTeam orgId={orgId} departments={departments} org={org} profileCount={profileCount} />
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
