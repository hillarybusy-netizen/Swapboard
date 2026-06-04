"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/actions";

interface LandingProfileDropdownProps {
  logoUrl?: string | null;
  initials: string;
}

export function LandingProfileDropdown({ logoUrl, initials }: LandingProfileDropdownProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none focus:outline-none">
          <Avatar className="w-8 h-8 border border-white/10 shadow-lg">
            <AvatarImage src={logoUrl || ""} alt="Company Logo" />
            <AvatarFallback className="bg-gold/10 text-gold text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-[#0b0a08] border border-white/10 text-white rounded-2xl p-2 shadow-2xl mt-2 mr-4" align="end">
        <DropdownMenuItem asChild className="text-white/80 hover:text-gold hover:bg-gold/10 rounded-xl px-3 py-2 cursor-pointer font-bold transition-all duration-200">
          <Link href="/dashboard" className="w-full flex items-center gap-2">
            Go To Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3 py-2 cursor-pointer font-bold transition-all duration-200"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
