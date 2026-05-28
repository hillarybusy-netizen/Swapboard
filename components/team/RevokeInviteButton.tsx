"use client";

import { useTransition } from "react";
import { deleteInvitation } from "@/lib/actions/invitations";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function RevokeInviteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRevoke = () => {
    if (confirm("Are you sure you want to revoke this invitation?")) {
      startTransition(async () => {
        try {
          const result = await deleteInvitation(id);
          if (result.success) {
            toast({
              title: "Success",
              description: "Invitation revoked successfully",
            });
          } else {
            toast({
              title: "Error",
              description: result.error || "Failed to revoke invitation",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      onClick={handleRevoke}
      disabled={isPending}
    >
      <Trash2 className={isPending ? "w-4 h-4 animate-pulse" : "w-4 h-4"} />
    </Button>
  );
}
