// app/cliente/notificaciones/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, Check, Loader2 } from "lucide-react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import {
  fetchNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  Notificacion,
} from "@/services/clienteNotificationsService";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.floor(hours / 24)} d`;
}

export default function ClienteNotificacionesPage() {
  const router = useRouter();
  const { cliente, isAuthenticated, isLoading: authLoading } = useClienteAuth();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/cliente/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!cliente?.id) return;
    fetchNotificaciones(cliente.id)
      .then(({ data }) => setNotificaciones(data))
      .finally(() => setIsLoading(false));
  }, [cliente?.id]);

  const handleMarkAll = async () => {
    if (!cliente?.id) return;
    await marcarTodasLeidas(cliente.id);
    setNotificaciones((prev) => prev.map((n) => ({ ...n, opened_at: new Date().toISOString() })));
  };

  const handleOpen = async (notificacion: Notificacion) => {
    if (notificacion.opened_at) return;
    await marcarNotificacionLeida(notificacion.id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === notificacion.id ? { ...n, opened_at: new Date().toISOString() } : n))
    );
  };

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const hasUnread = notificaciones.some((n) => !n.opened_at);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Notificaciones</h1>
        </div>
        {hasUnread && (
          <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs font-bold text-[#D9043D]">
            <Check className="w-3.5 h-3.5" />
            Marcar todas
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-red-600" />
          </div>
        )}

        {!isLoading && notificaciones.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 text-slate-400">
            <BellOff className="w-12 h-12 mb-4 text-slate-200" />
            <p className="text-sm">No tienes notificaciones.</p>
          </div>
        )}

        <div className="space-y-2">
          {notificaciones.map((n) => (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                n.opened_at ? "bg-white border-slate-100" : "bg-red-50/60 border-red-100"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  n.opened_at ? "bg-slate-100 text-slate-400" : "bg-[#D9043D]/10 text-[#D9043D]"
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {!n.opened_at && <span className="w-2 h-2 rounded-full bg-[#D9043D] shrink-0 mt-1.5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
