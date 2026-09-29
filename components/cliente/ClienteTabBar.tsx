// components/cliente/ClienteTabBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, Ticket, User } from "lucide-react";

const TABS = [
  { href: "/cliente/locales", label: "Inicio", icon: Store },
  { href: "/cliente/pedidos", label: "Pedidos", icon: Package },
  { href: "/cliente/cupones", label: "Cupones", icon: Ticket },
  { href: "/cliente/cuenta", label: "Perfil", icon: User },
];

export default function ClienteTabBar() {
  const pathname = usePathname() || "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.06)]">
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-[#D9043D]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-[#D9043D]" : "text-slate-400"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
