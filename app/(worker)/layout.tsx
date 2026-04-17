import { RefreshCw } from "lucide-react";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-4 pt-4">
        <div className="glass max-w-lg mx-auto rounded-full border-white/5 py-4 px-6 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/10">
              <RefreshCw className="w-4 h-4 text-gold" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">Swap<span className="text-gold">Board</span></span>
          </div>
          <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-gold transition-colors">
            Manager View
          </Link>
        </div>
      </header>

      {/* Bottom Nav */}
      <nav className="fixed bottom-8 inset-x-6 z-40">
        <div className="glass max-w-lg mx-auto rounded-full border-white/5 p-2 px-4 shadow-2xl flex items-center justify-between shadow-gold/5">
          {[
            { href: "/my-shifts", label: "My Shifts" },
            { href: "/swap-requests", label: "Swaps" },
          ].map(({ href, label }) => (
            <Link 
              key={href} 
              href={href} 
              className="flex-1 flex items-center justify-center py-3 text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-gold transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-28 pb-32">
        {children}
      </main>
    </div>
  );
}
