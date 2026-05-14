"use client";

import { useState } from "react";
import { deactivateUser } from "@/lib/actions/admin";
import { 
  MoreVertical, 
  UserMinus, 
  UserPlus,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function UserActions({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      await deactivateUser(user.id, !user.is_active);
      toast({
        title: user.is_active ? "User Deactivated" : "User Activated",
        description: `${user.full_name || user.email} has been ${user.is_active ? "disabled" : "enabled"}.`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "There was an error updating the user status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-white/20 hover:text-white/60">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-white/5 text-white/60">
        <DropdownMenuItem 
          onClick={handleToggleActive}
          disabled={loading}
          className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : user.is_active ? (
            <UserMinus className="w-3.5 h-3.5 text-red-500/60" />
          ) : (
            <UserPlus className="w-3.5 h-3.5 text-green-500/60" />
          )}
          {user.is_active ? "Deactivate User" : "Activate User"}
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer">
          <ShieldAlert className="w-3.5 h-3.5" />
          Force Reset Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
