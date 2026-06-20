import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { RealtimeNotificationsProvider } from "@/components/layout/RealtimeNotificationsProvider";
import { TimezoneInitializer } from "@/components/TimezoneInitializer";
import { DEFAULT_TITLE, SITE_URL } from "@/lib/seo";
import { rootMetadata } from "@/lib/metadata";

// Plus Jakarta Sans — clean, precise fintech grotesque (Duitech substitute)
// Used as the default body font across the entire site
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Space Grotesk — geometric, sharp display font (Gegola substitute)
// Used exclusively in the hero section headings
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  ...rootMetadata,
  title: {
    default: DEFAULT_TITLE,
    template: "%s | SwapBoard",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="dns-prefetch" href={SITE_URL} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site summary" />
      </head>
      <body className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${plusJakartaSans.className}`}>
        <AnimatedFavicon />
        <TimezoneInitializer />
        <RealtimeNotificationsProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
