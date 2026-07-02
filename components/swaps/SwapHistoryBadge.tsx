"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "swapHistoryLastSeen";

interface Props {
  historyItems: { requested_at: string }[];
}

export function SwapHistoryBadge({ historyItems }: Props) {
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (!lastSeen) {
      setUnseenCount(historyItems.length);
      return;
    }
    const lastSeenDate = new Date(lastSeen);
    const unseen = historyItems.filter(
      (item) => new Date(item.requested_at) > lastSeenDate
    ).length;
    setUnseenCount(unseen);
  }, [historyItems]);

  if (unseenCount === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[1rem] h-4 px-0.5 rounded-full bg-gold text-[#050505] text-[9px] font-black flex items-center justify-center">
      {unseenCount > 9 ? "9+" : unseenCount}
    </span>
  );
}
