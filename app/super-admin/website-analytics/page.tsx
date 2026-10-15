import { Activity, ArrowUpRight, BarChart3, Eye, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsPasswordForm } from "./AnalyticsPasswordForm";
import { lockWebsiteAnalytics } from "./actions";
import {
  isWebsiteAnalyticsSessionSecretConfigured,
  isWebsiteAnalyticsSessionValid,
  WEBSITE_ANALYTICS_COOKIE,
} from "@/lib/website-analytics-access";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const trackedMetrics = [
  {
    icon: Eye,
    title: "Page visits",
    description: "Records page views as visitors navigate the site.",
  },
  {
    icon: MousePointerClick,
    title: "Link and button clicks",
    description: "Counts clicks on interactive links and buttons.",
  },
  {
    icon: Activity,
    title: "Audience and engagement",
    description: "Google Analytics reports sessions, active users, and engagement.",
  },
];

export default async function WebsiteAnalyticsPage() {
  if (!isWebsiteAnalyticsSessionSecretConfigured()) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeading />
        <p role="alert" className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100">
          Configure <code>WEBSITE_ANALYTICS_SESSION_SECRET</code> with a random value of at least 32 characters to enable the password gate.
        </p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(WEBSITE_ANALYTICS_COOKIE)?.value;
  if (!isWebsiteAnalyticsSessionValid(session)) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeading />
        <AnalyticsPasswordForm />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading />
        <form action={lockWebsiteAnalytics}>
          <Button type="submit" variant="outline" className="border-white/10 text-white/70 hover:text-white">
            Lock page
          </Button>
        </form>
      </div>

      <section className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-white/[0.02] p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-xl font-black text-white">Your reports are in Google Analytics</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Website tracking is enabled. Open your Google Analytics account to view live activity,
          traffic reports, page views, and tracked link and button clicks. This setup does not
          require Google Cloud credentials.
        </p>
        <a
          href="https://analytics.google.com/analytics/"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-black text-black transition hover:bg-gold/90"
        >
          Open Google Analytics <ArrowUpRight className="h-4 w-4" />
        </a>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-white">What’s being tracked</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {trackedMetrics.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <Icon className="h-5 w-5 text-gold" />
              <h3 className="mt-4 font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/45">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PageHeading() {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-gold">Website reporting</p>
      <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Website Analytics</h1>
      <p className="mt-2 text-sm text-white/50">Traffic, visits, and click tracking</p>
    </div>
  );
}
