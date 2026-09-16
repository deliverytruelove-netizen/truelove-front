"use client";

import { Toaster } from "@/components/ui/toaster";
import CookieBanner from "@/components/CookieBanner";
import SmartAppBanner from "@/components/SmartAppBanner";

export default function ClientProviders() {
  return (
    <>
      <Toaster />
      <SmartAppBanner />
      <CookieBanner />
    </>
  );
}
