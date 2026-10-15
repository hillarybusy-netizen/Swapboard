"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    gtagInitialized?: boolean;
  }
}

const MEASUREMENT_ID = "G-G0SKTBTDHP";

function getTrackedPath(pathname: string) {
  return pathname.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ":id",
  );
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const trackedPath = getTrackedPath(pathname);

  useEffect(() => {
    if (!window.gtagInitialized) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", MEASUREMENT_ID, { send_page_view: false });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
      window.gtagInitialized = true;
    }

    const pageLocation = `${window.location.origin}${trackedPath}`;
    window.gtag("config", MEASUREMENT_ID, {
      send_page_view: false,
      page_location: pageLocation,
      page_path: trackedPath,
    });
    window.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: pageLocation,
      page_path: trackedPath,
    });
  }, [trackedPath]);

  useEffect(() => {
    function trackClicks(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (!target.closest("a, button, [role='button']")) return;

      const currentPath = getTrackedPath(window.location.pathname);
      window.gtag?.("event", "site_click", {
        page_location: `${window.location.origin}${currentPath}`,
        page_path: currentPath,
      });
    }

    document.addEventListener("click", trackClicks);
    return () => document.removeEventListener("click", trackClicks);
  }, []);

  return null;
}
