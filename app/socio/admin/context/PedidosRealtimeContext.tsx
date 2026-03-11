"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPedidosActivos,
  guardarTokenFcmWeb,
  reportNotificationStatus,
  type PedidoActivo,
} from "../services/pedido.service";
import { requestFCMToken, onForegroundMessage } from "@/lib/firebase";

const POLLING_INTERVAL = 5000;

interface PedidosRealtimeContextType {
  pedidos: PedidoActivo[];
  pedidosPendientes: PedidoActivo[];
  pedidosEnProceso: PedidoActivo[];
  pedidosListos: PedidoActivo[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  hasInteracted: boolean;
  invalidate: () => void;
}

const PedidosRealtimeContext = createContext<PedidosRealtimeContextType | null>(
  null,
);

export function usePedidosRealtimeContext() {
  const context = useContext(PedidosRealtimeContext);
  if (!context) {
    throw new Error(
      "usePedidosRealtimeContext must be used within PedidosRealtimeProvider",
    );
  }
  return context;
}

export function PedidosRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const prevIdsRef = useRef<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFirstLoad = useRef(true);
  const fcmInitialized = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const fcmJustNotified = useRef(false);

  // Pre-cargar el audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/nuevo_pedido.wav");
    audioRef.current.volume = 1.0;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Detectar interacción del usuario (necesaria para autoplay en navegadores)
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current
          .play()
          .then(() => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;
            audioRef.current!.volume = 1.0;
          })
          .catch(() => {});
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  const playSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Ignorar errores de autoplay en móvil
    }
  }, [soundEnabled]);

  const showBrowserNotification = useCallback((title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      if (Notification.permission !== "denied")
        Notification.requestPermission();
      return;
    }

    // En móvil, new Notification() no funciona - usar Service Worker
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: "/favicon.ico",
          tag: `pedido-${Date.now()}`,
        });
      });
    } else {
      // Desktop: usar new Notification() directamente
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag: `pedido-${Date.now()}`,
        });
      } catch {
        // Fallback silencioso si falla
      }
    }
  }, []);

  // Inicializar FCM Web - obtener token y escuchar mensajes foreground
  useEffect(() => {
    if (fcmInitialized.current) return;
    fcmInitialized.current = true;

    const initFCM = async () => {
      try {
        // Registrar Service Worker manualmente
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          // Enviar API URL al SW para que pueda reportar notificaciones
          const sw = registration.active || registration.installing || registration.waiting;
          if (sw) {
            sw.postMessage({
              type: "SET_API_URL",
              apiUrl: process.env.NEXT_PUBLIC_API_WEB,
            });
          }
        }

        // Obtener token FCM web
        const fcmToken = await requestFCMToken();
        if (fcmToken) {
          console.log("Token FCM web obtenido");
          // Guardar en el backend
          await guardarTokenFcmWeb(fcmToken);
          console.log("Token FCM web guardado en backend");
        }

        // Escuchar mensajes en primer plano (cuando la pestaña está activa)
        onForegroundMessage((payload) => {
          console.log("FCM foreground:", payload.title);
          // Reportar received_at al backend
          if (payload.notificationId) {
            reportNotificationStatus(payload.notificationId, "received");
          }
          // Marcar que FCM ya notificó para evitar duplicado con polling
          fcmJustNotified.current = true;
          setTimeout(() => {
            fcmJustNotified.current = false;
          }, 3000);
          // Reproducir sonido
          playSound();
          // Mostrar notificación del sistema (en foreground FCM no la muestra automáticamente)
          showBrowserNotification(
            payload.title || "Nuevo Pedido",
            payload.body || "Tienes un nuevo pedido",
          );
          // Refrescar lista de pedidos inmediatamente
          queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
        });
      } catch (error) {
        // FCM no es crítico - el polling sigue funcionando
        console.warn("FCM web no disponible, usando solo polling:", error);
      }
    };

    initFCM();
  }, [playSound, queryClient, showBrowserNotification]);

  const {
    data: pedidos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PedidoActivo[]>({
    queryKey: ["pedidos-activos"],
    queryFn: fetchPedidosActivos,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const pedidosPendientes = pedidos.filter(
    (p) => Number(p.ultimo_estado_tracking) === 1,
  );
  const pedidosEnProceso = pedidos.filter(
    (p) => Number(p.ultimo_estado_tracking) === 2,
  );
  const pedidosListos = pedidos.filter((p) =>
    [3, 4, 5, 6, 7, 9].includes(Number(p.ultimo_estado_tracking)),
  );

  // Detectar pedidos nuevos via polling y reproducir sonido
  useEffect(() => {
    if (isLoading) return;

    const currentIds = new Set(pedidos.map((p) => p.id));

    if (isFirstLoad.current) {
      prevIdsRef.current = currentIds;
      isFirstLoad.current = false;
      return;
    }

    const newPedidos = pedidos.filter((p) => !prevIdsRef.current.has(p.id));

    if (newPedidos.length > 0 && !fcmJustNotified.current) {
      // Solo notificar si FCM no lo hizo ya (evitar duplicados)
      console.log("Nuevos pedidos detectados via polling:", newPedidos.length);
      playSound();
      newPedidos.forEach((p) =>
        showBrowserNotification(
          "Nuevo Pedido #" + p.id,
          `${p.cliente} - ${p.detalle}`,
        ),
      );
    }

    prevIdsRef.current = currentIds;
  }, [pedidos, isLoading, playSound, showBrowserNotification]);

  // Asegurar que suene al volver a la pestaña si hay pedidos pendientes sin atender
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Al volver a la pestaña, si hay pedidos nuevos (pendientes) desde la última carga,
        // intentar refrescar y sonar si es necesario.
        console.log("Pestaña enfocada, verificando pedidos...");
        refetch();

        // Si hay pedidos pendientes que son muy recientes, podríamos forzar un sonido
        // como recordatorio por si falló en segundo plano
        if (pedidosPendientes.length > 0 && hasInteracted && soundEnabled) {
          // Opcional: Sonar un pequeño recordatorio si hay pendientes
          // playSound();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [
    pedidosPendientes.length,
    refetch,
    hasInteracted,
    soundEnabled,
    playSound,
  ]);

  // Solicitar permiso de notificación al montar
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);


  return (
    <PedidosRealtimeContext.Provider
      value={{
        pedidos,
        pedidosPendientes,
        pedidosEnProceso,
        pedidosListos,
        isLoading,
        isError,
        error: error as Error | null,
        refetch,
        soundEnabled,
        toggleSound,
        hasInteracted,
        invalidate: () =>
          queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] }),
      }}
    >
      {children}
    </PedidosRealtimeContext.Provider>
  );
}
