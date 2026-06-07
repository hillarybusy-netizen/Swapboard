"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

export function AdminSearch({
  placeholder,
  items,
  filterFn,
  children,
}: {
  placeholder: string;
  items: unknown[];
  filterFn: (item: any, query: string) => boolean;
  children: (filtered: any[]) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => filterFn(item, q));
  }, [items, query, filterFn]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-end gap-6 px-1">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.07] transition-all w-full md:w-80"
          />
        </div>
      </div>
      {children(filtered)}
    </div>
  );
}
