// components/cliente/ClienteHeaderActions.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ShoppingCart } from "lucide-react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { useClienteCart } from "@/context/ClienteCartContext";
import { fetchNotificaciones } from "@/services/clienteNotificationsService";

interface Props {
  variant?: "light" | "dark";
}

export default function ClienteHeaderActions({ variant = "light" }: Props) {
  const router = useRouter();
  const { cliente } = useClienteAuth();
  const { totalItemsCount } = useClienteCart();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!cliente?.id) return;
    fetchNotificaciones(cliente.id).then(({ noLeidas }) => setUnreadCount(noLeidas));
  }, [cliente?.id]);

  const iconColor = variant === "light" ? "text-white" : "text-slate-700";
  const bgColor = variant === "light" ? "bg-white/15 hover:bg-white/25" : "bg-slate-100 hover:bg-slate-200";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push("/cliente/notificaciones")}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${bgColor}`}
        aria-label="Notificaciones"
      >
        <Bell className={`w-[18px] h-[18px] ${iconColor}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      <button
        onClick={() => router.push("/cliente/carrito")}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${bgColor}`}
        aria-label="Carrito"
      >
        <ShoppingCart className={`w-[18px] h-[18px] ${iconColor}`} />
        {totalItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D9043D] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {totalItemsCount}
          </span>
        )}
      </button>
    </div>
  );
}
