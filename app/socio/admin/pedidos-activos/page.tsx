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
    pedidosPendientes,
    pedidosEnProceso,
    pedidosListos,
    isLoading,
    isError,
    error,
    refetch,
    soundEnabled,
    toggleSound,
    hasInteracted,
  } = usePedidosRealtimeContext();

  const [tab, setTab] = useState<"por_aceptar" | "en_preparacion" | "por_entregar">(
    "por_aceptar",
  );

  const pedidosFiltrados =
    tab === "por_aceptar"
      ? pedidosPendientes
      : tab === "en_preparacion"
        ? pedidosEnProceso
        : pedidosListos;

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

      {/* Tabs estilo Flutter */}
      <div className="bg-red-600 rounded-lg p-1 flex gap-1">
        <button
          onClick={() => setTab("por_aceptar")}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
            tab === "por_aceptar"
              ? "bg-white text-red-700 shadow-sm"
              : "text-red-100 hover:text-white hover:bg-red-500"
          }`}
        >
          <Clock className="h-3.5 w-3.5 hidden sm:block flex-shrink-0" />
          <span>Por Aceptar</span>
          {pedidosPendientes.length > 0 && (
            <span className={`ml-0.5 sm:ml-1 text-[10px] sm:text-xs font-bold rounded-full px-1 sm:px-1.5 py-0.5 min-w-[18px] sm:min-w-[20px] text-center ${
              tab === "por_aceptar"
                ? "bg-red-600 text-white"
                : "bg-white/20 text-white"
            }`}>
              {pedidosPendientes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("en_preparacion")}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
            tab === "en_preparacion"
              ? "bg-white text-red-700 shadow-sm"
              : "text-red-100 hover:text-white hover:bg-red-500"
          }`}
        >
          <ChefHat className="h-3.5 w-3.5 hidden sm:block flex-shrink-0" />
          <span className="sm:hidden">Preparando</span>
          <span className="hidden sm:inline">En Preparación</span>
          {pedidosEnProceso.length > 0 && (
            <span className={`ml-0.5 sm:ml-1 text-[10px] sm:text-xs font-bold rounded-full px-1 sm:px-1.5 py-0.5 min-w-[18px] sm:min-w-[20px] text-center ${
              tab === "en_preparacion"
                ? "bg-red-600 text-white"
                : "bg-white/20 text-white"
            }`}>
              {pedidosEnProceso.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("por_entregar")}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
            tab === "por_entregar"
              ? "bg-white text-red-700 shadow-sm"
              : "text-red-100 hover:text-white hover:bg-red-500"
          }`}
        >
          <Package className="h-3.5 w-3.5 hidden sm:block flex-shrink-0" />
          <span className="sm:hidden">Entregar</span>
          <span className="hidden sm:inline">Por Entregar</span>
          {pedidosListos.length > 0 && (
            <span className={`ml-0.5 sm:ml-1 text-[10px] sm:text-xs font-bold rounded-full px-1 sm:px-1.5 py-0.5 min-w-[18px] sm:min-w-[20px] text-center ${
              tab === "por_entregar"
                ? "bg-red-600 text-white"
                : "bg-white/20 text-white"
            }`}>
              {pedidosListos.length}
            </span>
          )}
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
            {tab === "por_aceptar"
              ? "No hay pedidos por aceptar"
              : tab === "en_preparacion"
                ? "No hay pedidos en preparación"
                : "No hay pedidos por entregar"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "por_aceptar"
              ? "Cuando llegue un nuevo pedido, sonará una alerta y aparecerá aquí."
              : tab === "en_preparacion"
                ? "Los pedidos que aceptes aparecerán aquí mientras se preparan."
                : "Los pedidos listos para entregar aparecerán aquí."}
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
