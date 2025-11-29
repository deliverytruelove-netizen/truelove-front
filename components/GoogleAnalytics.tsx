"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useCookieConsent } from "@/hooks/useCookieConsent";

// Reemplaza con tu ID de medición de Google Analytics
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export default function GoogleAnalytics() {
  const { hasAnalytics, consent } = useCookieConsent();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      // Actualizar el consentimiento cuando cambie
      window.gtag("consent", "update", {
        analytics_storage: hasAnalytics ? "granted" : "denied",
      });
    }
  }, [hasAnalytics]);

  // No cargar GA si no hay consentimiento
  if (!hasAnalytics && consent !== null) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Configuración inicial de consentimiento
            gtag('consent', 'default', {
              'analytics_storage': '${hasAnalytics ? "granted" : "denied"}'
            });

            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

// Extender el tipo Window para TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
