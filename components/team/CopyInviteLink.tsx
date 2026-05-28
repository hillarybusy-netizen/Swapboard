"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CopyInviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const inviteLink = `${window.location.origin}/invite?token=${token}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Invitation link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try manual selection.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-3 rounded-full hover:bg-gold/10 hover:text-gold transition-all gap-2 text-[10px] font-black uppercase tracking-widest"
      onClick={copyToClipboard}
    >
      {copied ? (
        <Check className="w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied" : "Copy Link"}
    </Button>
  );
}
