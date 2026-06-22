"use client";

import { Download } from "lucide-react";

interface AnalyticsExportProps {
  analytics: any;
  plan: string;
}

export function AnalyticsExport({ analytics, plan }: AnalyticsExportProps) {
  const handleExportCSV = () => {
    const rows = [
      ["Analytics Report", new Date().toLocaleDateString()],
      ["Plan", plan],
      [],
      ["Metric", "Value"],
      ["Total Swaps", analytics.totalSwaps],
      ["Fulfillment Rate", `${analytics.fulfillmentRate}%`],
      ["Active Swaps", analytics.activeSwaps],
    ];

    // Add advanced metrics if available
    if (analytics.costSavings !== undefined) {
      rows.push(
        ["Cost Savings", `$${analytics.costSavings.toLocaleString()}`],
        ["Manager Time Saved", `${analytics.managerHoursSaved.toFixed(1)}h`],
        ["Overtime Avoided", `${(analytics.overtimeAvoided || 0).toFixed(1)}h`],
        ["Cancellation Rate", `${(analytics.cancellationRate || 0)}%`]
      );
    }

    // Add enterprise metrics if available
    if (analytics.workerEngagementScore !== undefined) {
      rows.push(
        ["Worker Engagement Score", analytics.workerEngagementScore],
        ["Shift Coverage Rate", `${analytics.shiftCoverageRate}%`]
      );
    }

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      plan,
      analytics,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-bold transition-all"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-bold transition-all"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </button>
    </div>
  );
}
