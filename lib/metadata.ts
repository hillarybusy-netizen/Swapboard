import type { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  SEO_KEYWORDS,
  absoluteUrl,
} from "@/lib/seo";

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonical = absoluteUrl(path);

  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description,
    keywords: SEO_KEYWORDS,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    category: "Business",
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_CA",
      url: canonical,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Shift Swapping Platform`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
    other: {
      "geo.region": "CA",
      "content-language": "en-CA",
    },
    verification: {
      // Add tokens when available: google: "...", yandex: "..."
    },
  };
}

export const rootMetadata = createMetadata();

export const landingMetadata: Metadata = {
  ...createMetadata({ path: "/" }),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    ...createMetadata({ path: "/" }).openGraph,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    ...createMetadata({ path: "/" }).twitter,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};
