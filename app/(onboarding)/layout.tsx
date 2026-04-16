import { ArrowUpDown } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="flex items-center gap-3 p-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <ArrowUpDown className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg">SwapBoard</span>
      </header>
      <main className="max-w-3xl mx-auto px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
