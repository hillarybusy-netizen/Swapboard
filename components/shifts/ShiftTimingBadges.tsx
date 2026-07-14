"use client";

import { useEffect, useState } from "react";

interface ShiftTimingBadgesProps {
  status: string;
  startTime: string;
  endTime: string;
  lateStartedAt?: string | null;
  lateSubmittedAt?: string | null;
  className?: string;
}

export function ShiftTimingBadges({
  status,
  startTime,
  endTime,
  lateStartedAt,
  lateSubmittedAt,
  className = "",
}: ShiftTimingBadgesProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const isLateBeforeAction =
    !lateStartedAt &&
    !lateSubmittedAt &&
    ((status === "not_started" && now > new Date(startTime).getTime() + 5 * 60 * 1000) ||
      (["started", "overdue_not_done"].includes(status) && now > new Date(endTime).getTime() + 5 * 60 * 1000));

  const badges = [
    lateStartedAt && { label: "Late Started", title: "Started more than five minutes after the scheduled start time." },
    lateSubmittedAt && { label: "Late Submitted", title: "Submitted more than five minutes after the scheduled end time." },
    isLateBeforeAction && { label: "Late", title: "This shift is more than five minutes past its required start or submission time." },
  ].filter(Boolean) as Array<{ label: string; title: string }>;

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <span
          key={badge.label}
          title={badge.title}
          className="rounded-lg border border-orange-500/30 bg-orange-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-orange-300"
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
