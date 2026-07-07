export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://swapboard.ca"
).replace(/\/$/, "");

export const SITE_NAME = "SwapBoard";
export const SITE_DOMAIN = "swapboard.ca";

export const DEFAULT_TITLE =
  "SwapBoard — Shift Swapping Platform for Restaurants, Healthcare & Retail";

export const DEFAULT_DESCRIPTION =
  "SwapBoard is a shift swapping platform that lets staff trade shifts instantly while managers approve in one tap. Built for restaurants, healthcare, and retail. 94% swap fulfillment, 14-day free trial.";

export const SEO_KEYWORDS = [
  "shift swapping platform",
  "shift swap software",
  "employee shift trading",
  "schedule swap management",
  "shift coverage software",
  "restaurant shift swap",
  "healthcare shift swap",
  "retail shift scheduling",
  "workforce shift exchange",
  "manager shift approval",
  "SwapBoard",
  "swapboard.ca",
];

export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/onboarding/industry", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

export const FAQ_ITEMS = [
  {
    question: "What is SwapBoard?",
    answer:
      "SwapBoard is a shift swapping platform for businesses that need reliable shift coverage. Workers post swap requests from their phone, qualified colleagues accept instantly, and managers approve with one tap. Schedules update in real time for everyone.",
  },
  {
    question: "What industries does SwapBoard support?",
    answer:
      "SwapBoard supports restaurants, healthcare, retail, and other multi-department operations. You set up departments and roles that match your organization structure.",
  },
  {
    question: "How does shift swapping work on SwapBoard?",
    answer:
      "Set up your organization and invite your team. Workers request swaps from their phone. Qualified colleagues can accept instantly. Managers approve with one tap and the schedule updates automatically for everyone in real time.",
  },
  {
    question: "Is SwapBoard a good shift swapping platform for restaurants?",
    answer:
      "Yes. SwapBoard is built for real operations including restaurants. It supports multi-department setups, instant swap requests, push notifications, manager approvals, and ROI analytics showing overtime savings and manager time recovered.",
  },
  {
    question: "How much does SwapBoard cost?",
    answer:
      "SwapBoard offers Starter at $79/month (up to 100 workers), Growth at $199/month (up to 200 workers), and Enterprise at $499/month (unlimited workers). All plans include a 14-day free premium trial with no hidden fees.",
  },
  {
    question: "What results do teams see with SwapBoard?",
    answer:
      "Teams report a 94% swap fulfillment rate, 2-minute average swap resolution, $4,200 average monthly savings, and 3 hours of manager time saved per week.",
  },
];

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
