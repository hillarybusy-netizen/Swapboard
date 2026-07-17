"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, ChevronDown, X } from "lucide-react";

interface ExportReportDropdownProps {
  data: {
    metrics: any;
    swaps: any[];
    orgName: string;
  };
}

const REPORT_NOW = new Date();
const REPORT_START_DATE = new Date(REPORT_NOW);
REPORT_START_DATE.setDate(REPORT_NOW.getDate() - 30);
const REPORT_END_DATE = REPORT_NOW.toISOString().split("T")[0];
const REPORT_START_DATE_STRING = REPORT_START_DATE.toISOString().split("T")[0];

export function ExportReportDropdown({ data }: ExportReportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"day" | "month" | "year" | "custom" | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(REPORT_NOW.getMonth());
  const [selectedYear, setSelectedYear] = useState(REPORT_NOW.getFullYear());
  const [startDate, setStartDate] = useState(REPORT_START_DATE_STRING);
  const [endDate, setEndDate] = useState(REPORT_END_DATE);
  const [selectedFields, setSelectedFields] = useState<string[]>(["fulfillmentRate", "costSavings", "managerHoursSaved", "activeSwaps"]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allFields = [
    { key: "totalSwaps", label: "Total Swaps" },
    { key: "fulfillmentRate", label: "Fulfillment Rate" },
    { key: "activeSwaps", label: "Active Swaps" },
    { key: "costSavings", label: "Cost Savings" },
    { key: "managerHoursSaved", label: "Manager Time Saved" },
    { key: "overtimeAvoided", label: "Overtime Avoided" },
    { key: "cancellationRate", label: "Cancellation Rate" },
    { key: "avgFulfillmentTime", label: "Avg Fulfillment Time" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !dropdownRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateReport = (reportType: string) => {
    let reportData = {
      organizationName: data.orgName,
      exportDate: new Date().toISOString(),
      reportType,
      ...data.metrics,
    };

    let fileName = `${data.orgName.replace(/\s+/g, "_")}_report`;

    if (reportType === "day") {
      fileName += `_${new Date().toISOString().split("T")[0]}.csv`;
      generateCSV(reportData, fileName);
    } else if (reportType === "month") {
      fileName += `_${new Date(selectedYear, selectedMonth).toISOString().split("T")[0]}.csv`;
      reportData = { ...reportData, month: selectedMonth + 1, year: selectedYear };
      generateCSV(reportData, fileName);
    } else if (reportType === "year") {
      fileName += `_${selectedYear}.csv`;
      reportData = { ...reportData, year: selectedYear };
      generateCSV(reportData, fileName);
    } else if (reportType === "custom") {
      fileName += `_${startDate}_to_${endDate}.csv`;
      reportData = { ...reportData, startDate, endDate, fields: selectedFields };
      const filteredData = Object.fromEntries(
        Object.entries(reportData).filter(([key]) => selectedFields.includes(key) || !allFields.some(f => f.key === key))
      );
      generateCSV(filteredData, fileName);
    }

    setIsOpen(false);
    setActiveTab(null);
  };

  const generateCSV = (reportData: any, fileName: string) => {
    const rows: string[][] = [
      ["Organization", reportData.organizationName],
      ["Export Date", new Date(reportData.exportDate).toLocaleString()],
      ["Report Type", reportData.reportType],
      [],
    ];

    const ignoredKeys = ["organizationName", "exportDate", "reportType", "metrics", "swaps", "month", "year", "startDate", "endDate", "fields"];
    const metrics: Array<[string, number]> = Object.entries(reportData)
      .filter(([key, value]) => !ignoredKeys.includes(key) && typeof value === "number")
      .map(([key, value]) => [key, value as number]);

    // Excel displays these two rows as a horizontal metrics table.
    rows.push(
      metrics.map(([key]) => key.replace(/([A-Z])/g, " $1").trim()),
      metrics.map(([key, value]) => {
        if (key.includes("Rate") || key.includes("Fulfillment")) return `${value}%`;
        if (key.includes("Savings")) return `$${value.toLocaleString()}`;
        if (key.includes("Hours") || key.includes("Time")) return `${value.toFixed(1)}h`;
        return value.toString();
      })
    );

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-black uppercase tracking-widest transition-all"
      >
        <Download className="w-4 h-4" />
        Export Report
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div
          ref={panelRef}
          className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0a] shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Export report options"
        >
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
            {[
              { id: "day", label: "Day Report" },
              { id: "month", label: "Month Report" },
              { id: "year", label: "Annual Report" },
              { id: "custom", label: "Custom" },
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id === activeTab ? null : tab.id)}
                className={`min-w-0 px-2 py-3 text-[10px] font-black uppercase tracking-wide transition-all border-b-2 sm:px-3 sm:text-xs sm:tracking-widest ${
                  activeTab === tab.id
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-white/50 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Areas */}
          <div className="p-4 space-y-4">
            {/* Day Report */}
            {activeTab === "day" && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Export the last 24 hours of data</p>
                <button
                  onClick={() => generateReport("day")}
                  className="w-full px-4 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold font-bold rounded-lg transition-all"
                >
                  Export 24 Hours
                </button>
              </div>
            )}

            {/* Month Report */}
            {activeTab === "month" && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Select a month to export</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(2024, i).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => generateReport("month")}
                  className="w-full px-4 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold font-bold rounded-lg transition-all"
                >
                  Export Month
                </button>
              </div>
            )}

            {/* Annual Report */}
            {activeTab === "year" && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Select a year to export</p>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => generateReport("year")}
                  className="w-full px-4 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold font-bold rounded-lg transition-all"
                >
                  Export Year
                </button>
              </div>
            )}

            {/* Custom Report */}
            {activeTab === "custom" && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Create a custom report</p>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* Field Selection */}
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase block mb-2">Fields to Include</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allFields.map((field) => (
                      <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFields([...selectedFields, field.key]);
                            } else {
                              setSelectedFields(selectedFields.filter(f => f !== field.key));
                            }
                          }}
                          className="w-4 h-4 rounded border-white/30 accent-gold"
                        />
                        <span className="text-sm text-white/70">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => generateReport("custom")}
                  className="w-full px-4 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold font-bold rounded-lg transition-all"
                >
                  Export Custom Report
                </button>
              </div>
            )}

            {/* No Tab Selected */}
            {activeTab === null && (
              <div className="text-center py-6">
                <p className="text-white/50 text-sm">Select a report type above</p>
              </div>
            )}
          </div>
        </div>
        </div>,
        document.body
      )}
    </div>
  );
}
