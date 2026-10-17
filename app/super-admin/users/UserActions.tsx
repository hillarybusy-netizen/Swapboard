"use client";

import { useState, useTransition } from "react";
import {
  deactivateUser,
  superAdminDeleteUser,
  superAdminResetPassword,
  superAdminUpdateUserRole,
} from "@/lib/actions/admin";
import {
  MoreVertical,
  UserMinus,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  KeyRound,
  Trash2,
  UserCog,
  AlertTriangle,
  HardHat,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ROLES = [
  { value: "worker", label: "Worker", icon: UserCog },
  { value: "manager", label: "Manager", icon: HardHat },
  { value: "org_admin", label: "Org Admin", icon: ShieldCheck },
];

export function UserActions({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleToggleActive = () => {
    startTransition(async () => {
      try {
        await deactivateUser(user.id, !user.is_active);
        toast({
          title: user.is_active ? "User Deactivated" : "User Activated",
          description: `${user.full_name || user.email} has been ${user.is_active ? "disabled" : "enabled"}.`,
        });
      } catch {
        toast({ title: "Action Failed", description: "Could not update user status.", variant: "destructive" });
      }
    });
  };

  const handleChangeRole = (role: string) => {
    startTransition(async () => {
      try {
        await superAdminUpdateUserRole(user.id, role);
        toast({
          title: "Role Updated",
          description: `${user.full_name || user.email} is now a ${role.replace("_", " ")}.`,
        });
      } catch {
        toast({ title: "Failed", description: "Could not update role.", variant: "destructive" });
      }
    });
  };

  const handleResetPassword = () => {
    startTransition(async () => {
      try {
        await superAdminResetPassword(user.email);
        toast({
          title: "Password Reset Sent",
          description: `A reset link has been generated for ${user.email}. Check audit logs for the link.`,
        });
        setResetDialogOpen(false);
      } catch (err: any) {
        toast({
          title: "Reset Failed",
          description: err?.message || "Could not send password reset.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteUser = () => {
    startTransition(async () => {
      try {
        await superAdminDeleteUser(user.id);
        toast({
          title: "User Deleted",
          description: `${user.full_name || user.email} has been permanently removed.`,
        });
        setDeleteDialogOpen(false);
      } catch (err: any) {
        toast({
          title: "Delete Failed",
          description: err?.message || "Could not delete user.",
          variant: "destructive",
        });
      }
    });
  };

  // Don't allow actions on super admin accounts
  const isSuperAdmin = user.user_role === "super_admin";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-white/20 hover:text-white/60 hover:bg-white/5"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#0f0f0f] border-white/10 text-white/70 min-w-[200px]"
        >
          {/* Toggle Active/Deactivate */}
          <DropdownMenuItem
            onClick={handleToggleActive}
            disabled={isSuperAdmin || isPending}
            className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs"
          >
            {user.is_active ? (
              <UserMinus className="w-3.5 h-3.5 text-orange-400/70" />
            ) : (
              <UserPlus className="w-3.5 h-3.5 text-emerald-400/70" />
            )}
            {user.is_active ? "Deactivate User" : "Activate User"}
          </DropdownMenuItem>

          {/* Change Role submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={isSuperAdmin}
              className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400/60" />
              Change Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#0f0f0f] border-white/10 text-white/70">
              {ROLES.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleChangeRole(value)}
                  disabled={user.user_role === value}
                  className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs"
                >
                  <Icon className="w-3.5 h-3.5 text-white/30" />
                  {label}
                  {user.user_role === value && (
                    <span className="ml-auto text-[9px] text-gold/60">Current</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Force Password Reset */}
          <DropdownMenuItem
            onClick={() => setResetDialogOpen(true)}
            disabled={isSuperAdmin}
            className="flex items-center gap-2 focus:bg-white/5 focus:text-white cursor-pointer text-xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400/60" />
            Force Reset Password
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/5" />

          {/* Delete User */}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSuperAdmin}
            className="flex items-center gap-2 focus:bg-red-500/10 focus:text-red-400 text-red-400/60 cursor-pointer text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete User Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Password Reset Confirm Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-400">
              <KeyRound className="w-5 h-5" />
              Force Password Reset
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
              This will generate a password reset link for{" "}
              <span className="text-white font-semibold">{user.email}</span>. The link will be
              recorded in the audit log. The user will need to use it to set a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={isPending}
              className="bg-amber-600 text-white hover:bg-amber-700 border-amber-500"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              Generate Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
              This will{" "}
              <span className="text-red-400 font-bold">permanently delete</span>{" "}
              <span className="text-white font-semibold">
                {user.full_name || user.email}
              </span>
              's account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700 border-red-500"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
