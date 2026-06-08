"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeeklySwapData } from "@/lib/analytics";

const SwapChart = dynamic(
  () => import("@/components/dashboard/SwapChart").then((m) => ({ default: m.SwapChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-2xl" /> }
);

interface SwapChartLazyProps {
  data: WeeklySwapData[];
}

export function SwapChartLazy({ data }: SwapChartLazyProps) {
  return <SwapChart data={data} />;
}
