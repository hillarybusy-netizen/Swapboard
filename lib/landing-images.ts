/** Purpose-mapped landing page imagery — each path matches the section story */

export const LANDING_IMAGES = {
  features: {
    RefreshCw: {
      src: "/landing/feature-swap-request.jpg",
      alt: "Hourly worker posting a shift swap from their phone on the floor",
      label: "Post a swap from mobile",
    },
    Clock: {
      src: "/landing/feature-manager-approve.jpg",
      alt: "Manager reviewing and approving a shift swap on laptop",
      label: "One-tap manager approval",
    },
    BarChart3: {
      src: "/landing/feature-analytics-dashboard.jpg",
      alt: "Analytics dashboard showing shift savings and fulfillment metrics",
      label: "ROI & fulfillment analytics",
    },
    Users: {
      src: "/landing/feature-departments.jpg",
      alt: "Large workforce spread across departments and locations",
      label: "Multi-department coverage",
    },
    Shield: {
      src: "/landing/feature-compliance-audit.jpg",
      alt: "Signed compliance document and audit trail for shift changes",
      label: "Compliance audit trail",
    },
    TrendingUp: {
      src: "/landing/feature-trial-onboarding.jpg",
      alt: "Manager onboarding team and walking through SwapBoard setup",
      label: "14-day trial onboarding",
    },
  },
  showcase: {
    coverage: {
      src: "/landing/showcase-shift-trade.jpg",
      alt: "Team planning shift coverage on a shared schedule board",
      label: "Live shift board",
    },
    verification: {
      src: "/landing/showcase-verification.jpg",
      alt: "Healthcare worker whose certifications are verified before a swap",
      label: "Certification checks",
    },
    analytics: {
      src: "/landing/showcase-performance.jpg",
      alt: "Performance dashboard tracking swap fulfillment over time",
      label: "Schedule health metrics",
    },
  },
  steps: {
    setup: {
      src: "/landing/step-setup-org.jpg",
      alt: "Manager setting up organization and inviting the team",
      label: "Invite your team",
    },
    swap: {
      src: "/landing/step-worker-swap.jpg",
      alt: "Employee requesting a shift swap from their phone at work",
      label: "Request from phone",
    },
    approve: {
      src: "/landing/step-manager-approve.jpg",
      alt: "Manager approving a swap request on mobile",
      label: "Approve in one tap",
    },
  },
} as const;
