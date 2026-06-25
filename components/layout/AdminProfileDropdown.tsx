"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Settings, LogOut, User } from "lucide-react";
import { signOut } from "@/app/actions";

interface AdminProfileDropdownProps {
  email: string;
}

export function AdminProfileDropdown({ email }: AdminProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const initials = email
    .split("@")[0]
    .split(".")
    .map((part) => part[0].toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden w-10 h-10 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/30 transition-colors font-black text-sm"
        title={email}
      >
        {initials || <User className="w-5 h-5" />}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-12 w-48 rounded-xl bg-[#080808] border border-white/10 shadow-xl z-50 overflow-hidden">
          {/* Header with Email */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Admin Account</p>
            <p className="text-xs font-bold text-white mt-1 truncate">{email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Notifications */}
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/[0.03] transition-colors text-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="font-semibold">Notifications</span>
            </Link>

            {/* Settings */}
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/[0.03] transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="font-semibold">Settings</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-white/5 my-1" />

            {/* Logout */}
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
