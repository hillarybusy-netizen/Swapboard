"use client";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";

export function WorkerLogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    </form>
  );
}
