"use client";

import { Toaster } from "@/components/ui/toaster";
import CookieBanner from "@/components/CookieBanner";

export default function ClientProviders() {
  return (
    <>
      <Toaster />
      <CookieBanner />
    </>
  );
}
