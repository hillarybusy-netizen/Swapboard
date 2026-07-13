interface ShiftStatusSummaryProps {
  shifts: Array<{ status: string }>;
}

const SUMMARY_ITEMS = [
  {
    label: "Upcoming",
    statuses: ["not_started", "started", "up_for_swap", "pending_approval_claim", "pending_approval_swap"],
    color: "text-gold",
  },
  { label: "Completed", statuses: ["done_manager_approved"], color: "text-emerald-400" },
  { label: "Swapped", statuses: ["swapped"], color: "text-purple-400" },
  { label: "Overdue", statuses: ["overdue_not_done"], color: "text-orange-400" },
  { label: "No-shows", statuses: ["no_show"], color: "text-red-400" },
  { label: "Rejected", statuses: ["done_rejected"], color: "text-red-400" },
  { label: "Cancelled", statuses: ["cancelled"], color: "text-white/50" },
] as const;

export function ShiftStatusSummary({ shifts }: ShiftStatusSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
      {SUMMARY_ITEMS.map((item) => (
        <div key={item.label} className="glass rounded-2xl border border-white/5 p-4 text-center">
          <span className={`block text-2xl font-black ${item.color}`}>
            {shifts.filter((shift) => item.statuses.includes(shift.status as never)).length}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider text-white/30">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
