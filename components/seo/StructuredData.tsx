import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  FAQ_ITEMS,
  absoluteUrl,
} from "@/lib/seo";

export function LandingStructuredData() {
  const graph = [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/opengraph-image"),
      email: "hello@swapboard.app",
      description: DEFAULT_DESCRIPTION,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: DEFAULT_DESCRIPTION,
      featureList: [
        "Instant shift swap requests with push notifications",
        "One-tap manager approvals",
        "ROI analytics and overtime savings tracking",
        "Multi-department support for restaurant, healthcare, and retail",
        "Compliance-ready audit trail for every swap",
        "14-day premium trial",
      ],
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "79",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "79",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
        },
        {
          "@type": "Offer",
          name: "Growth",
          price: "199",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "199",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
        },
        {
          "@type": "Offer",
          name: "Enterprise",
          price: "499",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "499",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
