// app/cliente/layout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ClienteTabBar from "@/components/cliente/ClienteTabBar";

const FULLSCREEN_PATHS = [
  "/cliente/login",
  "/cliente/registro",
  "/cliente/recuperar-contrasena",
  "/cliente/buscar",
  "/cliente/carrito",
  "/cliente/checkout",
  "/cliente/pedido-espera",
];

// El detalle de un local (/cliente/locales/{id}) también es una vista de
// flujo, igual que en la app: no debe llevar el bottom nav.
const LOCAL_DETAIL_PATTERN = /^\/cliente\/locales\/.+/;

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const showTabBar =
    !FULLSCREEN_PATHS.some((p) => pathname.startsWith(p)) && !LOCAL_DETAIL_PATTERN.test(pathname);

  return (
    <div className={showTabBar ? "pb-16" : ""}>
      {children}
      {showTabBar && <ClienteTabBar />}
    </div>
  );
}
