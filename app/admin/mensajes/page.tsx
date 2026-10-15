// app/admin/mensajes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../dashboard/components/stat-card";
import { fetchWhatsappStats } from "./services/WhatsappStats.service";
import type { WhatsappStats } from "./types/WhatsappStats.types";
import { MessageCircle, Phone, Clock, DollarSign, Loader2 } from "lucide-react";

const formatSoles = (valor: number) => `S/ ${valor.toFixed(2)}`;

const MensajesPage: React.FC = () => {
  const [stats, setStats] = useState<WhatsappStats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    fetchWhatsappStats()
      .then((data) => {
        if (activo) setStats(data);
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar las estadísticas de mensajes.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Cuentas de mensajes</h1>

        {cargando && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando estadísticas...
          </div>
        )}

        {!cargando && error && <p className="text-destructive">{error}</p>}

        {!cargando && stats && (
          <Card>
            <CardHeader>
              <CardTitle>Truelove</CardTitle>
              <p className="text-sm text-muted-foreground">Estadísticas de este mes</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Todos los mensajes enviados"
                  value={stats.mensajes_enviados_mes}
                  icon={<MessageCircle />}
                />
                <StatCard
                  title="Mensajes enviados gratuitos del servicio de atención al cliente"
                  value={stats.mensajes_gratuitos_mes}
                  icon={<MessageCircle />}
                />
                <StatCard
                  title="Cargos aproximados"
                  value={formatSoles(stats.cargos_aproximados_mensajes)}
                  icon={<DollarSign />}
                />
                <StatCard
                  title="Todas las llamadas"
                  value={stats.llamadas_mes}
                  icon={<Phone />}
                />
                <StatCard
                  title="Duración promedio de las llamadas facturables (segundos)"
                  value={stats.duracion_promedio_llamadas_seg}
                  icon={<Clock />}
                />
                <StatCard
                  title="Cargos aproximados"
                  value={formatSoles(stats.cargos_aproximados_llamadas)}
                  icon={<DollarSign />}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">1 cuenta de WhatsApp está vinculada</p>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{stats.cuenta.nombre ?? "Truelove"}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.cuenta.telefono ?? "No disponible"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.mensajes_enviados_mes} mensajes enviados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default MensajesPage;
