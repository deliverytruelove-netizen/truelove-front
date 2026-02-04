"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  actualizarEstadoPedidoActivo,
  getEstadoActivoLabel,
  getEstadoNumerico,
  formatDate,
  type PedidoActivo,
} from "../../services/pedido.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ImageIcon,
  ShoppingBag,
  Eye,
  Printer,
} from "lucide-react";
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert";
import PedidoDetalleModal from "./PedidoDetalleModal";
import { TicketModal } from "../../components/ticket/TicketModal";

interface Props {
  pedido: PedidoActivo;
}

export default function PedidoActivoCard({ pedido }: Props) {
  const queryClient = useQueryClient();
  const estadoNum = getEstadoNumerico(pedido.ultimo_estado_tracking);
  const estadoInfo = getEstadoActivoLabel(estadoNum);
  const [showTiempoInput, setShowTiempoInput] = useState(false);
  const [tiempo, setTiempo] = useState("");
  const [showFotoPago, setShowFotoPago] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ estado, tiempo }: { estado: number; tiempo?: number }) =>
      actualizarEstadoPedidoActivo(pedido.id, estado, tiempo),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
      const mensajes: Record<number, string> = {
        0: "El pedido ha sido rechazado.",
        2: "Pedido aceptado. ¡A preparar!",
        3: "Pedido marcado como listo.",
      };
      const msg = mensajes[variables.estado];
      if (msg) {
        showAlert({
          title: variables.estado === 0 ? "Rechazado" : "Actualizado",
          text: msg,
          icon: variables.estado === 0 ? "info" : "success",
        });
      }
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "No se pudo actualizar el pedido.",
        icon: "error",
      });
    },
  });

  const handleAceptar = () => {
    if (estadoNum === 1) {
      setShowTiempoInput(true);
      return;
    }
    if (estadoNum === 2) {
      mutation.mutate({ estado: 3 });
    }
  };

  const confirmarAceptar = () => {
    const minutos = parseInt(tiempo) || 0;
    mutation.mutate({ estado: 2, tiempo: minutos });
    setShowTiempoInput(false);
    setTiempo("");
  };

  const handleMarcarListo = () => {
    mutation.mutate({ estado: 3 });
  };

  const handleRechazar = async () => {
    const result = await confirmAlert({
      title: "¿Rechazar pedido?",
      text: `¿Estás seguro de rechazar el pedido #${pedido.id}? Esta acción no se puede deshacer.`,
      icon: "warning",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "No, mantener",
    });
    if (result.isConfirmed) {
      mutation.mutate({ estado: 0 });
    }
  };

  const totalProductos =
    pedido.detalleArray?.reduce((sum, item) => {
      return sum + parseFloat(item.precio) * item.cantidad;
    }, 0) || 0;

  const totalConDelivery =
    totalProductos +
    (pedido.precio_delivery ? parseFloat(pedido.precio_delivery) : 0);

  const tipoPedidoLabel = pedido.tipo_pedido === 0 ? "Delivery" : "Recojo";

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        estadoNum === 1
          ? "border-yellow-400 border-2 shadow-md shadow-yellow-100/50 animate-pulse-subtle"
          : "border-gray-200 shadow-sm"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header compacto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">#{pedido.id}</span>
            <Badge
              className={`${estadoInfo.bgColor} ${estadoInfo.color} border-0 text-[11px] px-2 py-0`}
            >
              {estadoInfo.label}
            </Badge>
            <Badge variant="outline" className="text-[11px] px-1.5 py-0">
              {tipoPedidoLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {pedido.tiempo > 0 && (
              <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                {pedido.tiempo} min
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(pedido.created_at)}
            </span>
          </div>
        </div>

        {/* Cliente + Pago en una línea */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{pedido.cliente}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {pedido.celular}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            {pedido.tipo_pago}
          </span>
          {pedido.motorizado && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Bike className="h-3.5 w-3.5" />
              {pedido.motorizado}
            </span>
          )}
        </div>

        {/* Dirección */}
        {pedido.direccion_entrega && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{pedido.direccion_entrega}</span>
          </div>
        )}

        {/* Nota */}
        {pedido.nota && pedido.nota !== "Sin nota" && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground italic">
            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{pedido.nota}</span>
          </div>
        )}

        {/* Productos compactos */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Productos</span>
          </div>
          <div className="space-y-0.5">
            {pedido.detalleArray?.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span>
                  {item.nombre} x{item.cantidad}
                  {item.tipo === "adicional" && (
                    <span className="text-blue-600 ml-1">(adic.)</span>
                  )}
                </span>
                <span className="font-medium tabular-nums">
                  S/{(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-1.5 pt-1.5 space-y-0.5">
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span className="tabular-nums">
                S/{totalProductos.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Foto de pago */}
        {pedido.requiere_confirmacion_local && pedido.foto_pago && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFotoPago(!showFotoPago)}
              className="text-blue-600 h-7 text-xs px-2"
            >
              <ImageIcon className="h-3.5 w-3.5 mr-1" />
              {showFotoPago ? "Ocultar comprobante" : "Ver comprobante"}
            </Button>
            {showFotoPago && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pedido.foto_pago}
                  alt="Comprobante de pago"
                  className="max-w-full max-h-48 rounded-md border object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Input de tiempo */}
        {showTiempoInput && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 space-y-2">
            <p className="text-xs font-medium">
              Tiempo de preparacion (minutos):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[10, 15, 20, 30, 45].map((min) => (
                <Button
                  key={min}
                  variant={tiempo === String(min) ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
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
                className="w-16 h-7 text-xs"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={confirmarAceptar}
                disabled={mutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-8"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1" />
                )}
                Confirmar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
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

        {/* Botones de acción */}
        {!showTiempoInput && (
          <div className="space-y-2">
            {/* Fila principal de acciones */}
            <div className="flex gap-2">
              {estadoNum === 1 && (
                <>
                  <Button
                    onClick={handleAceptar}
                    disabled={mutation.isPending}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Aceptar
                  </Button>
                  <Button
                    onClick={handleRechazar}
                    disabled={mutation.isPending}
                    variant="destructive"
                    size="sm"
                    className="flex-1 h-10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </>
              )}

              {estadoNum === 2 && (
                <Button
                  onClick={handleMarcarListo}
                  disabled={mutation.isPending}
                  size="sm"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 h-10"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Marcar como Listo
                </Button>
              )}

              {(estadoNum === 3 || estadoNum === 9) && (
                <div className="flex-1 text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {estadoNum === 3
                      ? "Esperando motorizado..."
                      : "Esperando que el cliente recoja..."}
                  </p>
                </div>
              )}
            </div>

            {/* Botones Ver Detalle e Imprimir Ticket */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                onClick={() => setShowDetalle(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalle
              </Button>
              <TicketModal
                pedido={pedido}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1 h-9">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Ticket
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de detalle */}
      <PedidoDetalleModal
        pedido={pedido}
        open={showDetalle}
        onOpenChange={setShowDetalle}
      />
    </Card>
  );
}
