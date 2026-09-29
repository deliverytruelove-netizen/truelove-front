"use client";

import { Toaster } from "@/components/ui/toaster";
import CookieBanner from "@/components/CookieBanner";
import SmartAppBanner from "@/components/SmartAppBanner";
import { ClienteAuthProvider } from "@/context/ClienteAuthContext";
import { ClienteCartProvider } from "@/context/ClienteCartContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClienteAuthProvider>
      <ClienteCartProvider>
        {children}
        <Toaster />
        <SmartAppBanner />
        <CookieBanner />
      </ClienteCartProvider>
    </ClienteAuthProvider>
  );
}
