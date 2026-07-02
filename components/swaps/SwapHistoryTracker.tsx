"use client";
import { useEffect } from "react";

const STORAGE_KEY = "swapHistoryLastSeen";

export function SwapHistoryTracker() {
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  }, []);

  return null;
}
