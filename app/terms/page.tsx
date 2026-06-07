import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 max-w-2xl mx-auto">
      <Link href="/" className="text-gold text-sm hover:underline">← Back to SwapBoard</Link>
      <h1 className="text-3xl font-black mt-8 mb-4">Terms of Service</h1>
      <p className="text-white/60 text-sm leading-relaxed">
        SwapBoard provides shift management software for businesses. By using SwapBoard you agree to use the service responsibly and in compliance with applicable laws. Subscription plans are billed monthly. Contact hello@swapboard.app for questions.
      </p>
    </div>
  );
}
