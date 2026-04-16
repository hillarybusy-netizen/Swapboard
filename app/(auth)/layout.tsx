import { ArrowUpDown } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ArrowUpDown className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">SwapBoard</span>
        </div>
        {children}
      </div>
    </div>
  );
}
