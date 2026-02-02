"use client";

import { useState } from "react";
import { usePedidosRealtimeContext } from "../context/PedidosRealtimeContext";
import PedidoActivoCard from "./components/PedidoActivoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Volume2,
  VolumeX,
  AlertCircle,
  Bell,
  Package,
  Clock,
  ChefHat,
} from "lucide-react";

export default function PedidosActivosPage() {
  const {
    pedidos,
    pedidosPendientes,
    pedidosEnProceso,
    isLoading,
    isError,
    error,
    refetch,
    soundEnabled,
    toggleSound,
    hasInteracted,
  } = usePedidosRealtimeContext();

  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "en_proceso">(
    "todos",
  );

  const pedidosFiltrados =
    filtro === "pendientes"
      ? pedidosPendientes
      : filtro === "en_proceso"
        ? pedidosEnProceso
        : pedidos;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600" />
            Pedidos Activos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Se actualiza cada 5 segundos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className={
              soundEnabled
                ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "text-muted-foreground"
            }
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 mr-1.5" />
            ) : (
              <VolumeX className="h-4 w-4 mr-1.5" />
            )}
            {soundEnabled ? "Sonido ON" : "Sonido OFF"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Aviso si no ha interactuado */}
      {!hasInteracted && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Volume2 className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Activa el sonido
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Haz clic en cualquier parte de la pagina para activar las alertas de
            sonido cuando llegue un nuevo pedido.
          </AlertDescription>
        </Alert>
      )}

      {/* Contadores compactos */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro("todos")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all ${
            filtro === "todos"
              ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
              : "border-gray-200 text-muted-foreground hover:border-gray-300 dark:border-gray-700"
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span className="font-semibold">{pedidos.length}</span>
          <span className="hidden sm:inline">Activos</span>
        </button>
        <button
          onClick={() => setFiltro("pendientes")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all ${
            filtro === "pendientes"
              ? "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300"
              : "border-gray-200 text-muted-foreground hover:border-gray-300 dark:border-gray-700"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="font-semibold">{pedidosPendientes.length}</span>
          <span className="hidden sm:inline">Nuevos</span>
        </button>
        <button
          onClick={() => setFiltro("en_proceso")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all ${
            filtro === "en_proceso"
              ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
              : "border-gray-200 text-muted-foreground hover:border-gray-300 dark:border-gray-700"
          }`}
        >
          <ChefHat className="h-3.5 w-3.5" />
          <span className="font-semibold">{pedidosEnProceso.length}</span>
          <span className="hidden sm:inline">En proceso</span>
        </button>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar los pedidos."}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            ))}
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {filtro === "pendientes"
              ? "No hay pedidos nuevos"
              : filtro === "en_proceso"
                ? "No hay pedidos en proceso"
                : "No hay pedidos activos"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando llegue un nuevo pedido, sonara una alerta y aparecera aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pedidosFiltrados.map((pedido) => (
            <PedidoActivoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}

      {/* Indicador de polling activo */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-lg rounded-full px-3 py-1.5 border text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-muted-foreground">En vivo</span>
          {pedidosPendientes.length > 0 && (
            <Badge className="bg-red-500 text-white text-[10px] h-4 min-w-4 flex items-center justify-center p-0 px-1">
              {pedidosPendientes.length}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
