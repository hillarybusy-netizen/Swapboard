import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Start Free Trial — Shift Swapping Platform",
  description:
    "Sign up for SwapBoard at swapboard.ca. Free 14-day trial. Instant shift swap requests, one-tap manager approvals, and ROI analytics for restaurants, healthcare, and retail.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
