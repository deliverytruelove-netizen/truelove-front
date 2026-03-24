"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchPedidosActivos, type PedidoActivo } from "../../services/pedido.service"

const POLLING_INTERVAL = 5000 // 5 segundos, igual que la app Flutter

export function usePedidosRealtime() {
  const queryClient = useQueryClient()
  const prevIdsRef = useRef<Set<number>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isFirstLoad = useRef(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Pre-cargar el audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/nuevo_pedido.wav")
    audioRef.current.volume = 1.0
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Detectar interacción del usuario (necesaria para autoplay en navegadores)
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true)
      // Pre-cargar el audio con una reproducción silenciosa
      if (audioRef.current) {
        audioRef.current.volume = 0
        audioRef.current.play().then(() => {
          audioRef.current!.pause()
          audioRef.current!.currentTime = 0
          audioRef.current!.volume = 1.0
        }).catch(() => {
          // Ignorar errores de autoplay
        })
      }
    }

    window.addEventListener("click", handleInteraction, { once: true })
    window.addEventListener("keydown", handleInteraction, { once: true })

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  const playSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return

    audioRef.current.currentTime = 0
    audioRef.current.play().catch((err) => {
      console.warn("No se pudo reproducir el sonido:", err)
    })
  }, [soundEnabled])

  const showBrowserNotification = useCallback((pedido: PedidoActivo) => {
    if (!("Notification" in window)) return

    if (Notification.permission === "granted") {
      new Notification("Nuevo Pedido #" + pedido.id, {
        body: `${pedido.cliente} - ${pedido.detalle}`,
        icon: "/favicon.ico",
        tag: `pedido-${pedido.id}`,
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

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
  })

  // Detectar pedidos nuevos y reproducir sonido
  useEffect(() => {
    if (isLoading) return

    const currentIds = new Set(pedidos.map((p) => p.id))

    if (isFirstLoad.current) {
      prevIdsRef.current = currentIds
      isFirstLoad.current = false
      return
    }

    // Buscar IDs que no existían antes
    const newPedidos = pedidos.filter((p) => !prevIdsRef.current.has(p.id))

    if (newPedidos.length > 0) {
      playSound()
      newPedidos.forEach((p) => showBrowserNotification(p))
    }

    prevIdsRef.current = currentIds
  }, [pedidos, isLoading, playSound, showBrowserNotification])

  // Solicitar permiso de notificación al montar
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  const pedidosPendientes = pedidos.filter(
    (p) => Number(p.ultimo_estado_tracking) === 1
  )
  const pedidosEnProceso = pedidos.filter(
    (p) => [2, 3].includes(Number(p.ultimo_estado_tracking))
  )

  return {
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
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] }),
  }
}
