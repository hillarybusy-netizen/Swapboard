"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/actions";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  profile?: any;
  email?: string;
  children?: ReactNode;
  align?: "center" | "end" | "start";
}

export function ProfileDropdown({ profile, email, children, align = "end" }: Props) {
  const isWorker = profile?.user_role === "worker";
  const displayName = profile?.full_name ?? email ?? "?";
  const displayInitial = (profile?.full_name ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? children : (
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
            <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/10 ring-2 ring-gold/10">
              <AvatarFallback className="bg-gold/10 text-gold text-sm font-black italic">
                {displayInitial}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="w-56 glass card-premium border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl rounded-2xl"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black text-white">{displayName}</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{profile?.user_role ?? "user"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer rounded-xl">
          <Link href={isWorker ? "/my-profile" : profile?.user_role === "org_admin" ? "/admin/settings" : "/settings"}>
            <Settings className="mr-2 h-4 w-4 text-white/50" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="focus:bg-red-500/10 focus:text-red-400 text-red-500/80 cursor-pointer rounded-xl"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
