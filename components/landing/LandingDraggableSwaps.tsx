"use client";

import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { GripVertical, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_CARDS = [
  { id: "1", name: "Sarah M.", shift: "Fri 6pm–2am", dept: "Floor", color: "from-amber-500/20 to-gold/10" },
  { id: "2", name: "James K.", shift: "Sat 10am–6pm", dept: "Kitchen", color: "from-emerald-500/15 to-gold/5" },
  { id: "3", name: "Priya L.", shift: "Sun 2pm–10pm", dept: "Bar", color: "from-blue-500/15 to-gold/5" },
];

interface LandingDraggableSwapsProps {
  className?: string;
}

export function LandingDraggableSwaps({ className }: LandingDraggableSwapsProps) {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [swapped, setSwapped] = useState(false);

  const handleDragEnd = (id: string, _e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDraggingId(null);
    const threshold = 80;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      setCards((prev) => {
        const idx = prev.findIndex((c) => c.id === id);
        if (idx === -1) return prev;
        const next = [...prev];
        const target = info.offset.x > 0 ? Math.min(idx + 1, prev.length - 1) : Math.max(idx - 1, 0);
        if (target !== idx) {
          [next[idx], next[target]] = [next[target], next[idx]];
          setSwapped(true);
          setTimeout(() => setSwapped(false), 2000);
        }
        return next;
      });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5 text-gold/60" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Drag to reorder swaps
          </p>
        </div>
        <motion.span
          animate={{ opacity: swapped ? 1 : 0, y: swapped ? 0 : 4 }}
          className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider"
        >
          Swapped!
        </motion.span>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            layout
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragStart={() => setDraggingId(card.id)}
            onDragEnd={(e, info) => handleDragEnd(card.id, e, info)}
            whileDrag={{
              scale: 1.04,
              zIndex: 50,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: index * 0.1, duration: 0.5 },
            }}
            className={cn(
              "glass-item-transition flex items-center gap-3 p-3 rounded-2xl cursor-grab active:cursor-grabbing",
              "bg-gradient-to-r border border-white/10",
              card.color,
              draggingId === card.id ? "border-gold/40 shadow-lg shadow-gold/10" : "hover:border-white/20"
            )}
          >
            <GripVertical className="w-4 h-4 text-white/20 shrink-0 touch-none" />
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-xs font-black text-gold shrink-0">
              {card.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{card.name}</p>
              <p className="text-[10px] text-white/40 font-medium">{card.shift} · {card.dept}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">Open</span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-3 text-center text-[9px] text-white/25 font-medium">
        Try dragging a card — just like your team would swap shifts
      </p>
    </div>
  );
}
