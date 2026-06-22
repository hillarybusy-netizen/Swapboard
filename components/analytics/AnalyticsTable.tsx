"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface AnalyticsTableProps {
  title: string;
  description?: string;
  columns: Array<{ key: string; label: string; format?: (value: any) => string }>;
  data: Record<string, any>[];
  onExport?: () => void;
}

export function AnalyticsTable({
  title,
  description,
  columns,
  data,
  onExport,
}: AnalyticsTableProps) {
  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-black">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-gold" />
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((col) => (
                  <th key={col.key} className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4 text-white/80">
                      {col.format ? col.format(row[col.key]) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
