"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

type OS = "ios" | "android";
type AppKey = "cliente" | "socio" | "repartidor";

const APPS: Record<AppKey, { name: string; tagline: string; icon: string; play: string; ios: string }> = {
  cliente: {
    name: "True Love Cliente",
    tagline: "Pide tu delivery favorito",
    icon: "/apps/truelove-cliente.png",
    play: "https://play.google.com/store/apps/details?id=com.truelove.trueloveclient",
    ios: "https://apps.apple.com/app/id6759631687",
  },
  socio: {
    name: "True Love Socio",
    tagline: "Gestiona tu negocio desde el celular",
    icon: "/apps/truelove-socio.png",
    play: "https://play.google.com/store/apps/details?id=com.truelove.truelovesocio",
    ios: "https://apps.apple.com/app/id-truelove-socio",
  },
  repartidor: {
    name: "True Love Repartidor",
    tagline: "Genera ingresos repartiendo",
    icon: "/apps/truelove-repartidor.png",
    play: "https://play.google.com/store/apps/details?id=com.truelove.truelovebiker",
    ios: "https://apps.apple.com/app/id-truelove-motorizado",
  },
};

function getAppKeyForPath(pathname: string): AppKey {
  if (pathname.startsWith("/reparto") || pathname.startsWith("/motorizado")) return "repartidor";
  if (pathname.startsWith("/socio")) return "socio";
  return "cliente";
}

function detectOS(): OS | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  return null;
}

export default function SmartAppBanner() {
  const pathname = usePathname() || "/";
  const appKey = getAppKeyForPath(pathname);
  const app = APPS[appKey];

  const [os, setOs] = useState<OS | null>(null);
  const [visible, setVisible] = useState(false);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    const detected = detectOS();
    setOs(detected);
    if (!detected) return;

    const dismissed = localStorage.getItem("appBannerDismissed");
    if (dismissed === appKey) return;

    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [appKey]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const updateOffset = () => setOffsetTop(header.getBoundingClientRect().height);
    updateOffset();

    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    return () => observer.disconnect();
  }, [visible]);

  if (!os) return null;

  const storeUrl = os === "ios" ? app.ios : app.play;
  const storeLabel = os === "ios" ? "App Store" : "Google Play";

  const dismiss = () => {
    localStorage.setItem("appBannerDismissed", appKey);
    setVisible(false);
  };

  const handleInstall = () => {
    localStorage.setItem("appBannerDismissed", appKey);
    setVisible(false);
    window.open(storeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{ top: offsetTop }}
          className="fixed left-0 right-0 z-40 p-2.5"
        >
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 p-3">
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm">
              <Image
                src={app.icon}
                alt={app.name}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {app.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {app.tagline} · {storeLabel}
              </p>
            </div>

            <button
              onClick={handleInstall}
              className="px-4 py-2 text-xs font-bold text-white bg-[#D9043D] hover:bg-red-700 rounded-xl shadow-md transition-colors whitespace-nowrap shrink-0"
            >
              Instalar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
