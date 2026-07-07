import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/shifts",
          "/swaps",
          "/team",
          "/settings",
          "/admin",
          "/my-shifts",
          "/swap-requests",
          "/onboarding",
          "/invite",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/privacy", "/terms", "/onboarding/industry", "/llms.txt"],
        disallow: ["/dashboard", "/admin", "/settings", "/onboarding"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/privacy", "/terms", "/onboarding/industry", "/llms.txt"],
        disallow: ["/dashboard", "/admin", "/settings", "/onboarding"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/privacy", "/terms", "/onboarding/industry", "/llms.txt"],
        disallow: ["/dashboard", "/admin", "/settings", "/onboarding"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/privacy", "/terms", "/onboarding/industry", "/llms.txt"],
        disallow: ["/dashboard", "/admin", "/settings", "/onboarding"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
