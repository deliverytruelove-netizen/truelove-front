"use client";

import { useState, useEffect } from "react";
import { getCookieConsent, setCookieConsent, CookieConsent } from "@/lib/cookies";

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentConsent = getCookieConsent();
    setConsent(currentConsent);
    setIsLoading(false);
  }, []);

  const updateConsent = (newConsent: CookieConsent) => {
    setCookieConsent(newConsent);
    setConsent(newConsent);
  };

  const hasAnalytics = consent === "all";
  const hasMarketing = consent === "all";
  const hasPersonalization = consent === "all";

  return {
    consent,
    isLoading,
    updateConsent,
    hasAnalytics,
    hasMarketing,
    hasPersonalization,
    hasConsent: consent !== null,
  };
}
