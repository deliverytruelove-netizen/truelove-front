"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useCookieConsent } from "@/hooks/useCookieConsent";

// Reemplaza con tu ID de Facebook Pixel
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "YOUR_PIXEL_ID";

export default function FacebookPixel() {
  const { hasMarketing, consent } = useCookieConsent();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq && hasMarketing) {
      // Trackear la página actual
      window.fbq("track", "PageView");
    }
  }, [hasMarketing]);

  // No cargar Facebook Pixel si no hay consentimiento de marketing
  if (!hasMarketing && consent !== null) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', '${FB_PIXEL_ID}');
            ${hasMarketing ? "fbq('track', 'PageView');" : ""}
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  );
}

// Extender el tipo Window para TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}
