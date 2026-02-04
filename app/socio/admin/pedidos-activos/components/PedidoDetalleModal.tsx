"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  actualizarEstadoPedidoActivo,
  verificarConfirmacionPago,
  getEstadoActivoLabel,
  getEstadoNumerico,
  formatDate,
  type PedidoActivo,
} from "../../services/pedido.service";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import {
  Check,
  X,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  Bike,
  Loader2,
  ShoppingBag,
  Receipt,
  Download,
  ChefHat,
  Package,
  Truck,
  Home,
  CheckCircle2,
  XCircle,
  Timer,
  Store,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
} from "lucide-react";

// Modal de confirmación personalizado (evita problemas con SweetAlert en Drawer)
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "success" | "info";
  isLoading?: boolean;
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColors = {
    warning: "text-amber-500 bg-amber-100",
    danger: "text-red-500 bg-red-100",
    success: "text-green-500 bg-green-100",
    info: "text-blue-500 bg-blue-100",
  };

  const buttonColors = {
    warning: "bg-brand-600 hover:bg-brand-700",
    danger: "bg-brand-600 hover:bg-brand-700",
    success: "bg-brand-600 hover:bg-brand-700",
    info: "bg-brand-600 hover:bg-brand-700",
  };

  const Icon = type === "danger" ? AlertTriangle : type === "success" ? CheckCircle : type === "info" ? Info : AlertCircle;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 text-center">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColors[type]}`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-5">{message}</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              className={`flex-1 text-white ${buttonColors[type]}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de alerta (solo OK)
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "warning" | "error" | "success" | "info";
}

function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: AlertModalProps) {
  if (!isOpen) return null;

  const iconColors = {
    warning: "text-amber-500 bg-amber-100",
    error: "text-red-500 bg-red-100",
    success: "text-green-500 bg-green-100",
    info: "text-blue-500 bg-blue-100",
  };

  const buttonColors = {
    warning: "bg-brand-600 hover:bg-brand-700",
    error: "bg-brand-600 hover:bg-brand-700",
    success: "bg-brand-600 hover:bg-brand-700",
    info: "bg-brand-600 hover:bg-brand-700",
  };

  const Icon = type === "error" ? XCircle : type === "success" ? CheckCircle : type === "warning" ? AlertTriangle : Info;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 text-center">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColors[type]}`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-5">{message}</p>
          <Button 
            className={`w-full text-white ${buttonColors[type]}`} 
            onClick={onClose}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  pedido: PedidoActivo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Timeline de estados
const ESTADOS_DELIVERY = [
  { estado: 2, label: "Preparando", icon: ChefHat },
  { estado: 3, label: "Listo", icon: Package },
  { estado: 4, label: "Motorizado aceptó", icon: Bike },
  { estado: 5, label: "En restaurante", icon: Store },
  { estado: 6, label: "En camino", icon: Truck },
  { estado: 7, label: "Llegó", icon: Home },
  { estado: 8, label: "Entregado", icon: CheckCircle2 },
];

const ESTADOS_RECOJO = [
  { estado: 2, label: "Preparando", icon: ChefHat },
  { estado: 9, label: "Listo para recoger", icon: Package },
  { estado: 8, label: "Entregado", icon: CheckCircle2 },
];

// Colores para métodos de pago
const METODO_PAGO_CONFIG: Record<string, { bgColor: string }> = {
  yape: { bgColor: "bg-purple-600" },
  plin: { bgColor: "bg-cyan-500" },
  efectivo: { bgColor: "bg-green-700" },
  "pos tarjeta credito": { bgColor: "bg-pink-600" },
  pos: { bgColor: "bg-pink-600" },
};

function getMetodoPagoConfig(tipoPago: string | undefined) {
  if (!tipoPago) return { bgColor: "bg-gray-700" };
  return METODO_PAGO_CONFIG[tipoPago.toLowerCase()] || { bgColor: "bg-gray-700" };
}

function PedidoDetalleContent({
  pedido,
  onClose,
}: {
  pedido: PedidoActivo;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const estadoNum = getEstadoNumerico(pedido.ultimo_estado_tracking);
  const estadoInfo = getEstadoActivoLabel(estadoNum);
  const [showTiempoInput, setShowTiempoInput] = useState(false);
  const [tiempo, setTiempo] = useState("");
  const [showFotoPago, setShowFotoPago] = useState(false);
  
  // Estados para modales personalizados
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "error" | "success" | "info";
    onCloseCallback?: () => void;
  }>({ isOpen: false, title: "", message: "", type: "info" });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "danger" | "success" | "info";
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", type: "warning", confirmText: "Confirmar", cancelText: "Cancelar", onConfirm: () => {} });

  const esDelivery = pedido.tipo_pedido === 0;
  const estadosTimeline = esDelivery ? ESTADOS_DELIVERY : ESTADOS_RECOJO;
  const metodoPagoConfig = getMetodoPagoConfig(pedido.tipo_pago);

  // Helper para mostrar alertas
  const showCustomAlert = (title: string, message: string, type: "warning" | "error" | "success" | "info", onCloseCallback?: () => void) => {
    setAlertModal({ isOpen: true, title, message, type, onCloseCallback });
  };

  // Mutation para cambiar estado
  const mutation = useMutation({
    mutationFn: ({ estado, tiempo }: { estado: number; tiempo?: number }) =>
      actualizarEstadoPedidoActivo(pedido.id, estado, tiempo),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
      const mensajes: Record<number, string> = {
        0: "El pedido ha sido rechazado.",
        2: "Pedido aceptado. ¡A preparar!",
        3: "Pedido marcado como listo.",
        9: "Pedido listo para recoger.",
      };
      const msg = mensajes[variables.estado];
      if (msg) {
        showCustomAlert(
          variables.estado === 0 ? "Rechazado" : "Actualizado",
          msg,
          variables.estado === 0 ? "info" : "success",
          variables.estado === 0 ? onClose : undefined
        );
      }
    },
    onError: (error: Error) => {
      showCustomAlert("Error", error.message || "No se pudo actualizar el pedido.", "error");
    },
  });

  // Mutation para verificar pago
  const verificarPagoMutation = useMutation({
    mutationFn: () => verificarConfirmacionPago(pedido.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
      showCustomAlert("Pago verificado", "El pago ha sido verificado correctamente.", "success");
    },
    onError: (error: Error) => {
      showCustomAlert("Error", error.message || "No se pudo verificar el pago.", "error");
    },
  });

  const handleAceptar = () => {
    if (estadoNum === 1) {
      setShowTiempoInput(true);
      return;
    }
    if (estadoNum === 2) {
      const nuevoEstado = esDelivery ? 3 : 9;
      mutation.mutate({ estado: nuevoEstado });
    }
  };

  const confirmarAceptar = () => {
    const minutos = parseInt(tiempo) || 0;
    mutation.mutate({ estado: 2, tiempo: minutos });
    setShowTiempoInput(false);
    setTiempo("");
  };

  const handleRechazar = () => {
    setConfirmModal({
      isOpen: true,
      title: "¿Rechazar pedido?",
      message: `¿Estás seguro de rechazar el pedido #${pedido.id}? Esta acción no se puede deshacer.`,
      type: "danger",
      confirmText: "Sí, rechazar",
      cancelText: "No, mantener",
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        mutation.mutate({ estado: 0 });
      },
    });
  };

  const handleVerificarPago = () => {
    if (!pedido.foto_pago) {
      showCustomAlert("Sin comprobante", "El cliente aún no ha subido el comprobante de pago.", "warning");
      return;
    }
    setShowFotoPago(true);
  };

  const confirmarVerificacionPago = () => {
    setConfirmModal({
      isOpen: true,
      title: "¿Verificar pago?",
      message: "¿Confirmas que el pago ha sido recibido correctamente?",
      type: "info",
      confirmText: "Sí, verificar",
      cancelText: "Cancelar",
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        verificarPagoMutation.mutate();
        setShowFotoPago(false);
      },
    });
  };

  const handleDescargarComprobante = () => {
    if (pedido.foto_pago) {
      window.open(pedido.foto_pago, "_blank");
    }
  };

  const handleLlamar = (numero: string) => {
    window.location.href = `tel:${numero}`;
  };

  // Cálculos de totales - usar siempre detalleArray para consistencia con la tarjeta
  const totalProductos =
    pedido.detalleArray?.reduce((sum, item) => {
      return sum + parseFloat(item.precio) * item.cantidad;
    }, 0) || 0;

  const descuento = pedido.descuento ? parseFloat(pedido.descuento) : 0;
  const total = totalProductos - descuento;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header con estado */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base md:text-lg">#{pedido.id}</span>
          <Badge className={`${estadoInfo.bgColor} ${estadoInfo.color} border-0 text-xs`}>
            {estadoInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {esDelivery ? "Delivery" : "Recojo"}
          </Badge>
          {pedido.tiempo > 0 && (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              <Timer className="h-3 w-3" />
              {pedido.tiempo} min
            </span>
          )}
        </div>
      </div>

      {/* Timeline horizontal en móvil, vertical en desktop */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4">
        <h4 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
          <Timer className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Progreso
        </h4>
        
        {/* Timeline horizontal para móvil */}
        <div className="flex md:hidden overflow-x-auto gap-1 pb-2">
          {estadosTimeline.map((step, index) => {
            const isCompleted = estadoNum >= step.estado;
            const isCurrent = estadoNum === step.estado;
            const Icon = step.icon;
            return (
              <div key={step.estado} className="flex flex-col items-center min-w-[60px]">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${isCompleted ? "bg-black text-white" : "bg-white border-2 border-gray-300 text-gray-400"}
                    ${isCurrent ? "ring-2 ring-black ring-offset-1 scale-110" : ""}
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-[10px] mt-1 text-center leading-tight ${isCompleted ? "font-medium" : "text-muted-foreground"}`}>
                  {step.label.split(" ")[0]}
                </span>
                {index < estadosTimeline.length - 1 && (
                  <div className="absolute h-0.5 w-4 bg-gray-200 top-4 -right-2 hidden" />
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline vertical para desktop */}
        <div className="hidden md:block space-y-2">
          {estadosTimeline.map((step, index) => {
            const isCompleted = estadoNum >= step.estado;
            const isCurrent = estadoNum === step.estado;
            const Icon = step.icon;
            return (
              <div key={step.estado} className="flex items-center gap-3">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${isCompleted ? "bg-black text-white" : "bg-white border-2 border-gray-300 text-gray-400"}
                    ${isCurrent ? "ring-2 ring-black ring-offset-2" : ""}
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-sm ${isCompleted ? "font-medium" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {index < estadosTimeline.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards de contacto en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {/* Cliente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{pedido.cliente}</p>
                <p className="text-xs text-muted-foreground">{pedido.celular}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 shrink-0 h-8 w-8 md:h-9 md:w-auto md:px-3"
              onClick={() => handleLlamar(pedido.celular)}
            >
              <Phone className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Llamar</span>
            </Button>
          </div>
        </div>

        {/* Motorizado */}
        {pedido.motorizado && estadoNum >= 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                  <Bike className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{pedido.motorizado}</p>
                  <p className="text-xs text-muted-foreground">{pedido.celular_motorizado || "Sin tel."}</p>
                </div>
              </div>
              {pedido.celular_motorizado && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 shrink-0 h-8 w-8 md:h-9 md:w-auto md:px-3"
                  onClick={() => handleLlamar(pedido.celular_motorizado)}
                >
                  <Phone className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Llamar</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nota del cliente */}
      {pedido.nota && pedido.nota !== "Sin nota" && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Nota</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{pedido.nota}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pago y comprobante en una fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Método de pago */}
        <div className={`rounded-lg p-3 text-white ${metodoPagoConfig.bgColor}`}>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <div>
              <p className="text-xs opacity-90">Pago</p>
              <p className="font-semibold text-sm">{pedido.tipo_pago || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* Comprobante */}
        {(pedido.tipo_comprobante || pedido.documento) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-medium">Comprobante</p>
                <p className="text-sm text-muted-foreground">
                  {pedido.tipo_comprobante || "Ninguno"} {pedido.documento && `- ${pedido.documento}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dirección */}
      {esDelivery && pedido.direccion_entrega && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium">Dirección</p>
              <p className="text-sm text-muted-foreground">{pedido.direccion_entrega}</p>
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
        <h4 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Productos
        </h4>
        <div className="space-y-1">
          {pedido.detalleArray?.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm">
                  ({item.cantidad}) {item.nombre}
                </span>
                {item.tipo === "adicional" && (
                  <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1 py-0">Adic.</Badge>
                )}
              </div>
              <span className="font-medium text-xs md:text-sm tabular-nums">
                S/{(parseFloat(item.precio) * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="border-t mt-2 pt-2 space-y-0.5">
          {descuento > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Descuento</span>
              <span className="tabular-nums">-S/{descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base md:text-lg font-bold pt-1">
            <span>Total</span>
            <span className="text-orange-600 tabular-nums">S/{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatDate(pedido.created_at)}</span>
      </div>

      {/* Modal de foto de pago */}
      {showFotoPago && pedido.foto_pago && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden">
            <div className="bg-brand-600 text-white p-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Comprobante de pago</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-brand-700 h-8 w-8"
                  onClick={handleDescargarComprobante}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-brand-700 h-8 w-8"
                  onClick={() => setShowFotoPago(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pedido.foto_pago}
                alt="Comprobante"
                className="w-full h-auto max-h-[45vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-3 border-t">
              <p className="text-center text-sm mb-3">¿Verificar este pago?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setShowFotoPago(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-10 bg-brand-600 hover:bg-brand-700 text-white"
                  onClick={confirmarVerificacionPago}
                  disabled={verificarPagoMutation.isPending}
                >
                  {verificarPagoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Verificar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input de tiempo */}
      {showTiempoInput && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
          <p className="text-xs md:text-sm font-medium">Tiempo de preparación (min):</p>
          <div className="flex flex-wrap gap-1.5">
            {[10, 15, 20, 30, 45].map((min) => (
              <Button
                key={min}
                variant={tiempo === String(min) ? "default" : "outline"}
                size="sm"
                className="h-9 px-3"
                onClick={() => setTiempo(String(min))}
              >
                {min}
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Otro"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              className="w-16 h-9"
              min="1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={confirmarAceptar}
              disabled={mutation.isPending}
              className="flex-1 h-10 bg-green-600 hover:bg-green-700"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Confirmar
            </Button>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                setShowTiempoInput(false);
                setTiempo("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Botones de acción - sticky en móvil */}
      {!showTiempoInput && estadoNum < 8 && (
        <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-2">
          {estadoNum === 1 && pedido.requiere_confirmacion_local && (
            <Button
              onClick={handleVerificarPago}
              className="flex-1 h-11 bg-brand-600 hover:bg-brand-700 text-sm text-white"
              disabled={verificarPagoMutation.isPending}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Verificar pago
            </Button>
          )}

          {estadoNum === 1 && !pedido.requiere_confirmacion_local && (
            <>
              <Button
                onClick={handleAceptar}
                disabled={mutation.isPending}
                className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-sm"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Aceptar
              </Button>
              <Button
                onClick={handleRechazar}
                disabled={mutation.isPending}
                variant="destructive"
                className="flex-1 h-11 text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </>
          )}

          {estadoNum === 2 && (
            <Button
              onClick={handleAceptar}
              disabled={mutation.isPending}
              className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-sm"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Marcar como Listo
            </Button>
          )}

          {(estadoNum === 3 || estadoNum === 9) && (
            <div className="flex-1 text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground">
                {estadoNum === 3 ? "Esperando motorizado..." : "Esperando al cliente..."}
              </p>
            </div>
          )}

          {estadoNum >= 4 && estadoNum <= 7 && (
            <div className="flex-1 text-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                {estadoNum === 4 && "Motorizado en camino al local..."}
                {estadoNum === 5 && "Motorizado recogiendo pedido..."}
                {estadoNum === 6 && "Pedido en camino..."}
                {estadoNum === 7 && "Motorizado llegó al destino..."}
              </p>
            </div>
          )}
        </div>
      )}

      {estadoNum === 0 && (
        <div className="flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <XCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Pedido cancelado</p>
        </div>
      )}

      {estadoNum === 8 && (
        <div className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Pedido entregado</p>
        </div>
      )}

      {/* Modales personalizados */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          setAlertModal(prev => ({ ...prev, isOpen: false }));
          if (alertModal.onCloseCallback) {
            alertModal.onCloseCallback();
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isLoading={mutation.isPending}
      />
    </div>
  );
}

// Contenido para Desktop - Layout de dos columnas compacto
function PedidoDetalleDesktop({
  pedido,
  onClose,
}: {
  pedido: PedidoActivo;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const estadoNum = getEstadoNumerico(pedido.ultimo_estado_tracking);
  const estadoInfo = getEstadoActivoLabel(estadoNum);
  const [showTiempoInput, setShowTiempoInput] = useState(false);
  const [tiempo, setTiempo] = useState("");
  const [showFotoPago, setShowFotoPago] = useState(false);
  
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "error" | "success" | "info";
    onCloseCallback?: () => void;
  }>({ isOpen: false, title: "", message: "", type: "info" });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "danger" | "success" | "info";
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", type: "warning", confirmText: "Confirmar", cancelText: "Cancelar", onConfirm: () => {} });

  const esDelivery = pedido.tipo_pedido === 0;
  const estadosTimeline = esDelivery ? ESTADOS_DELIVERY : ESTADOS_RECOJO;
  const metodoPagoConfig = getMetodoPagoConfig(pedido.tipo_pago);

  const showCustomAlert = (title: string, message: string, type: "warning" | "error" | "success" | "info", onCloseCallback?: () => void) => {
    setAlertModal({ isOpen: true, title, message, type, onCloseCallback });
  };

  const mutation = useMutation({
    mutationFn: ({ estado, tiempo }: { estado: number; tiempo?: number }) =>
      actualizarEstadoPedidoActivo(pedido.id, estado, tiempo),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
      const mensajes: Record<number, string> = {
        0: "El pedido ha sido rechazado.",
        2: "Pedido aceptado. ¡A preparar!",
        3: "Pedido marcado como listo.",
        9: "Pedido listo para recoger.",
      };
      const msg = mensajes[variables.estado];
      if (msg) {
        showCustomAlert(
          variables.estado === 0 ? "Rechazado" : "Actualizado",
          msg,
          variables.estado === 0 ? "info" : "success",
          variables.estado === 0 ? onClose : undefined
        );
      }
    },
    onError: (error: Error) => {
      showCustomAlert("Error", error.message || "No se pudo actualizar el pedido.", "error");
    },
  });

  const verificarPagoMutation = useMutation({
    mutationFn: () => verificarConfirmacionPago(pedido.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
      showCustomAlert("Pago verificado", "El pago ha sido verificado correctamente.", "success");
    },
    onError: (error: Error) => {
      showCustomAlert("Error", error.message || "No se pudo verificar el pago.", "error");
    },
  });

  const handleAceptar = () => {
    if (estadoNum === 1) {
      setShowTiempoInput(true);
      return;
    }
    if (estadoNum === 2) {
      const nuevoEstado = esDelivery ? 3 : 9;
      mutation.mutate({ estado: nuevoEstado });
    }
  };

  const confirmarAceptar = () => {
    const minutos = parseInt(tiempo) || 0;
    mutation.mutate({ estado: 2, tiempo: minutos });
    setShowTiempoInput(false);
    setTiempo("");
  };

  const handleRechazar = () => {
    setConfirmModal({
      isOpen: true,
      title: "¿Rechazar pedido?",
      message: `¿Estás seguro de rechazar el pedido #${pedido.id}? Esta acción no se puede deshacer.`,
      type: "danger",
      confirmText: "Sí, rechazar",
      cancelText: "No, mantener",
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        mutation.mutate({ estado: 0 });
      },
    });
  };

  const handleVerificarPago = () => {
    if (!pedido.foto_pago) {
      showCustomAlert("Sin comprobante", "El cliente aún no ha subido el comprobante de pago.", "warning");
      return;
    }
    setShowFotoPago(true);
  };

  const confirmarVerificacionPago = () => {
    setConfirmModal({
      isOpen: true,
      title: "¿Verificar pago?",
      message: "¿Confirmas que el pago ha sido recibido correctamente?",
      type: "info",
      confirmText: "Sí, verificar",
      cancelText: "Cancelar",
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        verificarPagoMutation.mutate();
        setShowFotoPago(false);
      },
    });
  };

  const handleLlamar = (numero: string) => {
    window.location.href = `tel:${numero}`;
  };

  const handleDescargarComprobante = () => {
    if (pedido.foto_pago) {
      window.open(pedido.foto_pago, "_blank");
    }
  };

  // Cálculos de totales - usar siempre detalleArray para consistencia con la tarjeta
  const totalProductos = pedido.detalleArray?.reduce((sum, item) => sum + parseFloat(item.precio) * item.cantidad, 0) || 0;
  const descuento = pedido.descuento ? parseFloat(pedido.descuento) : 0;
  const total = totalProductos - descuento;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">#{pedido.id}</span>
          <Badge className={`${estadoInfo.bgColor} ${estadoInfo.color} border-0`}>{estadoInfo.label}</Badge>
          <Badge variant="outline">{esDelivery ? "Delivery" : "Recojo"}</Badge>
          {pedido.tiempo > 0 && (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              <Timer className="h-3 w-3" />
              {pedido.tiempo} min
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatDate(pedido.created_at)}
        </span>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-2 gap-4 py-4">
        {/* Columna izquierda */}
        <div className="space-y-3">
          {/* Timeline compacto horizontal */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Progreso</h4>
            <div className="flex items-center gap-1">
              {estadosTimeline.map((step, index) => {
                const isCompleted = estadoNum >= step.estado;
                const isCurrent = estadoNum === step.estado;
                const Icon = step.icon;
                return (
                  <div key={step.estado} className="flex items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? "bg-black text-white" : "bg-white border border-gray-300 text-gray-400"}
                        ${isCurrent ? "ring-2 ring-black ring-offset-1" : ""}`}
                      title={step.label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {index < estadosTimeline.length - 1 && (
                      <div className={`w-3 h-0.5 ${isCompleted ? "bg-black" : "bg-gray-300"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cliente */}
          <div className="flex items-center justify-between bg-white border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <User className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{pedido.cliente}</p>
                <p className="text-xs text-muted-foreground">{pedido.celular}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8" onClick={() => handleLlamar(pedido.celular)}>
              <Phone className="h-3 w-3 mr-1" /> Llamar
            </Button>
          </div>

          {/* Motorizado */}
          {pedido.motorizado && estadoNum >= 2 && (
            <div className="flex items-center justify-between bg-white border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Bike className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{pedido.motorizado}</p>
                  <p className="text-xs text-muted-foreground">{pedido.celular_motorizado || "Sin tel."}</p>
                </div>
              </div>
              {pedido.celular_motorizado && (
                <Button variant="outline" size="sm" className="h-8" onClick={() => handleLlamar(pedido.celular_motorizado)}>
                  <Phone className="h-3 w-3 mr-1" /> Llamar
                </Button>
              )}
            </div>
          )}

          {/* Nota */}
          {pedido.nota && pedido.nota !== "Sin nota" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-800">Nota del cliente</p>
              <p className="text-sm text-amber-700">{pedido.nota}</p>
            </div>
          )}

          {/* Pago y Comprobante */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-lg p-2.5 text-white ${metodoPagoConfig.bgColor}`}>
              <p className="text-[10px] opacity-80">Pago</p>
              <p className="font-semibold text-sm">{pedido.tipo_pago || "No especificado"}</p>
            </div>
            {(pedido.tipo_comprobante || pedido.documento) && (
              <div className="bg-gray-100 rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Comprobante</p>
                <p className="text-sm font-medium">{pedido.tipo_comprobante} {pedido.documento && `- ${pedido.documento}`}</p>
              </div>
            )}
          </div>

          {/* Dirección */}
          {esDelivery && pedido.direccion_entrega && (
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Dirección de entrega</p>
                  <p className="text-sm">{pedido.direccion_entrega}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - Productos */}
        <div className="bg-white border rounded-lg p-3 flex flex-col">
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5" /> Productos
          </h4>
          <div className="flex-1 space-y-1 text-sm">
            {pedido.detalleArray?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-1 border-b border-dashed last:border-0">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">({item.cantidad})</span>
                  <span>{item.nombre}</span>
                  {item.tipo === "adicional" && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">Adic.</Badge>
                  )}
                </div>
                <span className="font-medium tabular-nums">S/{(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-2 pt-2 space-y-1 text-sm">
            {descuento > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span className="tabular-nums">-S/{descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-1">
              <span>Total</span>
              <span className="text-brand-600 tabular-nums">S/{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input de tiempo */}
      {showTiempoInput && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium">Tiempo de preparación (minutos):</p>
          <div className="flex gap-2">
            {[10, 15, 20, 30, 45].map((min) => (
              <Button
                key={min}
                variant={tiempo === String(min) ? "default" : "outline"}
                size="sm"
                onClick={() => setTiempo(String(min))}
              >
                {min}
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Otro"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              className="w-20 h-9"
              min="1"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={confirmarAceptar} disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Confirmar
            </Button>
            <Button variant="outline" onClick={() => { setShowTiempoInput(false); setTiempo(""); }}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {!showTiempoInput && estadoNum < 8 && (
        <div className="flex gap-2 pt-2 border-t">
          {estadoNum === 1 && pedido.requiere_confirmacion_local && (
            <Button onClick={handleVerificarPago} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white" disabled={verificarPagoMutation.isPending}>
              <CreditCard className="h-4 w-4 mr-2" /> Verificar pago
            </Button>
          )}
          {estadoNum === 1 && !pedido.requiere_confirmacion_local && (
            <>
              <Button onClick={handleAceptar} disabled={mutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Aceptar Pedido
              </Button>
              <Button onClick={handleRechazar} disabled={mutation.isPending} variant="destructive" className="flex-1">
                <X className="h-4 w-4 mr-2" /> Rechazar
              </Button>
            </>
          )}
          {estadoNum === 2 && (
            <Button onClick={handleAceptar} disabled={mutation.isPending} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Marcar como Listo
            </Button>
          )}
          {(estadoNum === 3 || estadoNum === 9) && (
            <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">{estadoNum === 3 ? "Esperando motorizado..." : "Esperando al cliente..."}</p>
            </div>
          )}
          {estadoNum >= 4 && estadoNum <= 7 && (
            <div className="flex-1 text-center py-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                {estadoNum === 4 && "Motorizado en camino al local..."}
                {estadoNum === 5 && "Motorizado recogiendo pedido..."}
                {estadoNum === 6 && "Pedido en camino..."}
                {estadoNum === 7 && "Motorizado llegó al destino..."}
              </p>
            </div>
          )}
        </div>
      )}

      {estadoNum === 0 && (
        <div className="flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg">
          <XCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm font-medium text-red-700">Pedido cancelado</p>
        </div>
      )}

      {estadoNum === 8 && (
        <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium text-green-700">Pedido entregado</p>
        </div>
      )}

      {/* Modal de foto de pago */}
      {showFotoPago && pedido.foto_pago && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden">
            <div className="bg-brand-600 text-white p-3 flex items-center justify-between">
              <h3 className="font-semibold">Comprobante de pago</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-brand-700 h-8 w-8" onClick={handleDescargarComprobante}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-brand-700 h-8 w-8" onClick={() => setShowFotoPago(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3">
              <Image src={pedido.foto_pago} alt="Comprobante" className="w-full h-auto max-h-[50vh] object-contain rounded-lg" />
            </div>
            <div className="p-3 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowFotoPago(false)}>Cancelar</Button>
              <Button className="flex-1 bg-brand-600 hover:bg-brand-700 text-white" onClick={confirmarVerificacionPago} disabled={verificarPagoMutation.isPending}>
                {verificarPagoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Verificar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => { setAlertModal(prev => ({ ...prev, isOpen: false })); if (alertModal.onCloseCallback) alertModal.onCloseCallback(); }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isLoading={mutation.isPending}
      />
    </>
  );
}

export default function PedidoDetalleModal({ pedido, open, onOpenChange }: Props) {
  const isMobile = useIsMobile();

  // Drawer para móvil/tablet
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="pb-0 pt-2">
            <DrawerTitle className="text-base">Detalle del Pedido</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: "calc(95vh - 60px)" }}>
            <PedidoDetalleContent pedido={pedido} onClose={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Dialog para desktop - Layout compacto de dos columnas
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-5">
        <PedidoDetalleDesktop pedido={pedido} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
