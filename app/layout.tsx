import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { DEFAULT_TITLE, SITE_URL } from "@/lib/seo";
import { rootMetadata } from "@/lib/metadata";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AnimatedFavicon />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
