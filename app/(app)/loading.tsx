import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="absolute inset-0 blur-lg bg-primary/10 rounded-full animate-pulse" />
      </div>
      <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">
        Updating your dashboard...
      </p>
    </div>
  );
}
