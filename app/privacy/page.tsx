import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 max-w-2xl mx-auto">
      <Link href="/" className="text-gold text-sm hover:underline">← Back to SwapBoard</Link>
      <h1 className="text-3xl font-black mt-8 mb-4">Privacy Policy</h1>
      <p className="text-white/60 text-sm leading-relaxed">
        SwapBoard collects account information (name, email, organization details) to provide shift scheduling services. We do not sell your data. Emails are sent via Resend. Data is stored securely in Supabase. Contact hello@swapboard.app for data requests.
      </p>
    </div>
  );
}
