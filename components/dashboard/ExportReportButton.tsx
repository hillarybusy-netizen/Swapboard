"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ExportReportButtonProps {
  data: {
    metrics: any;
    swaps: any[];
    orgName: string;
  };
}

export function ExportReportButton({ data }: ExportReportButtonProps) {
  const exportToCSV = () => {
    const { metrics, swaps, orgName } = data;

    // 1. Prepare Header
    let csvContent = `SwapBoard Performance Report - ${orgName}\n`;
    csvContent += `Generated at: ${new Date().toLocaleString()}\n\n`;

    // 2. KPIs Section
    csvContent += "METRIC,VALUE,DETAILS\n";
    csvContent += `Fulfillment Rate,${metrics.fulfillmentRate}%,${metrics.totalSwapsFulfilled} of ${metrics.totalSwapsRequested} requested fulfilled\n`;
    csvContent += `Cost Savings,${formatCurrency(metrics.costSavings)},vs. overtime & agency fees (30 days)\n`;
    csvContent += `Manager Time Saved,${metrics.managerHoursSaved.toFixed(1)}h,vs. manual phone coordination\n`;
    csvContent += `Active Swaps,${metrics.activeSwaps},in progress right now\n\n`;

    // 3. Swaps Section
    csvContent += "RECENT SWAPS\n";
    csvContent += "ID,STATUS,REASON,REQUESTED AT\n";
    swaps.slice(0, 50).forEach((s) => {
      csvContent += `${s.id},${s.status},"${s.reason || ""}",${new Date(s.created_at).toLocaleString()}\n`;
    });

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SwapBoard_Report_${orgName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline" 
      className="glass border-white/5 rounded-full text-xs font-bold uppercase tracking-widest px-6 h-10 hover:bg-white/5"
      onClick={exportToCSV}
    >
      <Download className="w-4 h-4 mr-2" />
      Export Report
    </Button>
  );
}
