// Contact rule: hello@ for general contact and outreach, onboard@ for demos and pilots.
export const GENERAL_EMAIL = "hello@swapboard.ca";
export const ONBOARD_EMAIL = "onboard@swapboard.ca";
export const COMPANY_LOCATION = "Barrie, Ontario, Canada";

// Every "Book a demo" button points here. Swap for a calendar link later without touching copy.
export const DEMO_HREF = `mailto:${ONBOARD_EMAIL}?subject=${encodeURIComponent("SwapBoard demo request")}`;
export const DEMO_SECTION_HREF = "/#demo";

export const SOCIAL_LINKS = {
  tiktok: "https://www.tiktok.com/@swapboard",
  linkedin: "https://www.linkedin.com/in/chukwuebuka-okonkwo-5837aa320",
} as const;
