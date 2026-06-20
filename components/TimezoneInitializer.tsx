"use client";

import { useEffect } from "react";
import { detectUserTimezone } from "@/lib/timezone";
import { updateUserTimezone } from "@/lib/actions/profile";

export function TimezoneInitializer() {
  useEffect(() => {
    async function initializeTimezone() {
      try {
        const detectedTimezone = detectUserTimezone();
        // Store timezone in database via server action
        await updateUserTimezone(detectedTimezone).catch(() => {
          // Fail silently - timezone detection is not critical
        });
      } catch {
        // Fail silently
      }
    }

    initializeTimezone();
  }, []);

  return null;
}
