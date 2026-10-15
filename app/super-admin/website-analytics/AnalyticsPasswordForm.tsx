"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { unlockWebsiteAnalytics } from "./actions";

export function AnalyticsPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await unlockWebsiteAnalytics(new FormData(event.currentTarget));
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Unable to unlock analytics.");
      }
    } catch {
      setError("Unable to unlock analytics. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-gold/10 p-3 text-gold">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-white">Password protected</h2>
          <p className="text-sm text-white/50">Enter the analytics page password to continue.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="analytics-password" className="sr-only">Analytics page password</label>
        <input
          id="analytics-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/50"
          placeholder="Password"
        />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gold px-4 py-3 font-bold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Checking..." : "Unlock analytics"}
        </button>
      </form>
    </div>
  );
}
