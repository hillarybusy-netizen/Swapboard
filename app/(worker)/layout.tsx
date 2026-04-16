import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">SwapBoard</span>
          </div>
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Manager view →</Link>
        </div>
      </header>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-40 pb-safe">
        <div className="flex max-w-lg mx-auto">
          {[
            { href: "/my-shifts", label: "My Shifts" },
            { href: "/swap-requests", label: "Swap Requests" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="flex-1 flex items-center justify-center py-3 text-sm font-medium text-muted-foreground hover:text-primary">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {children}
      </main>
    </div>
  );
}
