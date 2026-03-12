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
  type PedidoDetalle,
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
  ShoppingBag,
  Eye,
  Printer,
  Download,
} from "lucide-react";
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert";
import PedidoDetalleModal from "./PedidoDetalleModal";
import CountdownTimer from "./CountdownTimer";
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

  const verificarPagoMutation = useMutation({
    mutationFn: () => verificarConfirmacionPago(pedido.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-activos"] });
      showAlert({
        title: "Pago verificado",
        text: "El pago ha sido verificado correctamente. Ahora puedes aceptar el pedido.",
        icon: "success",
      });
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "No se pudo verificar el pago.",
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

  const handleVerificarPago = async () => {
    if (!pedido.foto_pago) {
      showAlert({
        title: "Sin comprobante",
        text: "El cliente aún no ha subido el comprobante de pago.",
        icon: "warning",
      });
      return;
    }
    
    // Mostrar la foto del pago
    setShowFotoPago(true);
  };

  const handleDescargarComprobante = async () => {
    if (!pedido.foto_pago) return;
    try {
      const response = await fetch(pedido.foto_pago);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = pedido.foto_pago.split(".").pop()?.split("?")[0] || "jpg";
      link.download = `comprobante-pedido-${pedido.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(pedido.foto_pago, "_blank");
    }
  };

  const confirmarVerificacionPago = async () => {
    const result = await confirmAlert({
      title: "¿Verificar pago?",
      text: "¿Confirmas que el pago ha sido recibido correctamente?",
      icon: "info",
      confirmButtonText: "Sí, verificar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      verificarPagoMutation.mutate();
      setShowFotoPago(false);
    }
  };

  const totalProductos =
    pedido.detalleArray?.reduce((sum, item) => {
      return sum + parseFloat(item.precio) * item.cantidad;
    }, 0) || 0;

  // const precioDelivery = (pedido.precio_delivery ? parseFloat(pedido.precio_delivery) : 0);

  const tipoPedidoLabel = pedido.tipo_pedido === 0 ? "Delivery" : "Recojo";

  // Agrupar productos con sus adicionales
  const productosAgrupados = (() => {
    if (!pedido.detalleArray) return [];
    
    const grupos: Array<{
      producto: PedidoDetalle;
      adicionales: PedidoDetalle[];
    }> = [];
    
    let ultimoProducto: { producto: PedidoDetalle; adicionales: PedidoDetalle[] } | null = null;
    
    pedido.detalleArray.forEach((item) => {
      if (item.tipo === "item") {
        // Es un producto principal
        ultimoProducto = { producto: item, adicionales: [] };
        grupos.push(ultimoProducto);
      } else if (item.tipo === "adicional" && ultimoProducto) {
        // Es un adicional, agregar al último producto
        ultimoProducto.adicionales.push(item);
      } else if (item.tipo === "adicional" && !ultimoProducto) {
        // Adicional sin producto (caso edge), mostrarlo como producto
        grupos.push({ producto: item, adicionales: [] });
      }
    });
    
    return grupos;
  })();

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
            {pedido.tiempo > 0 && pedido.fecha_inicio && estadoNum === 2 ? (
              <CountdownTimer
                tiempoMinutos={pedido.tiempo}
                fechaInicio={pedido.fecha_inicio}
                size={44}
              />
            ) : pedido.tiempo > 0 ? (
              <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                {pedido.tiempo} min
              </span>
            ) : null}
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

        {/* Productos compactos con jerarquía */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Productos</span>
          </div>
          <div className="space-y-0.5">
            {productosAgrupados.map((grupo, index) => (
              <div key={`grupo-${index}`} className="space-y-0.5">
                {/* Producto principal */}
                <div className="flex justify-between text-xs">
                  <span className="font-medium">
                    {grupo.producto.nombre} x{grupo.producto.cantidad}
                  </span>
                  <span className="font-medium tabular-nums">
                    S/{(parseFloat(grupo.producto.precio) * grupo.producto.cantidad).toFixed(2)}
                  </span>
                </div>
                
                {/* Adicionales indentados */}
                {grupo.adicionales.map((adicional) => (
                  <div key={adicional.id} className="flex justify-between text-xs pl-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">└─</span>
                      <span className="italic">{adicional.nombre}</span>
                      <span className="text-blue-600 text-[10px]">(adic.)</span>
                    </span>
                    <span className="tabular-nums">
                      S/{(parseFloat(adicional.precio) * adicional.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
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

        {/* Modal de foto de pago */}
        {showFotoPago && pedido.foto_pago && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden">
              <div className="bg-red-600 text-white p-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Comprobante de pago - Pedido #{pedido.id}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-red-700 h-8 w-8"
                    onClick={handleDescargarComprobante}
                    title="Descargar comprobante"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-red-700 h-8 w-8"
                    onClick={() => setShowFotoPago(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pedido.foto_pago}
                  alt="Comprobante"
                  className="w-full h-auto max-h-[50vh] object-contain rounded-lg"
                />
              </div>
              <div className="p-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setShowFotoPago(false)}
                >
                  Cerrar
                </Button>
                {estadoNum === 1 && (
                  <Button
                    className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
                    onClick={confirmarVerificacionPago}
                    disabled={verificarPagoMutation.isPending}
                  >
                    {verificarPagoMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Verificar Pago
                  </Button>
                )}
              </div>
            </div>
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
              {estadoNum === 1 && pedido.requiere_confirmacion_local && (
                <>
                  <Button
                    onClick={handleVerificarPago}
                    disabled={verificarPagoMutation.isPending}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-10"
                  >
                    {verificarPagoMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-1" />
                    )}
                    Verificar pago
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

              {estadoNum === 1 && !pedido.requiere_confirmacion_local && (
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
                <>
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
                  {pedido.foto_pago && (
                    <Button
                      onClick={() => setShowFotoPago(true)}
                      size="sm"
                      variant="outline"
                      className="h-10 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver pago
                    </Button>
                  )}
                </>
              )}

              {[3, 4, 5, 6, 7, 9].includes(estadoNum) && (
                <>
                  <div className="flex-1 space-y-2">
                    {/* Estado actual del pedido */}
                    <div className="text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        {estadoNum === 3 && "Esperando motorizado..."}
                        {estadoNum === 4 && "Motorizado aceptó el pedido"}
                        {estadoNum === 5 && "Motorizado llegó al restaurante"}
                        {estadoNum === 6 && "Motorizado en camino al cliente"}
                        {estadoNum === 7 && "Motorizado llegó al destino"}
                        {estadoNum === 9 && "Esperando que el cliente recoja..."}
                      </p>
                    </div>
                    {/* Info del motorizado */}
                    {pedido.motorizado && [3, 4, 5, 6, 7].includes(estadoNum) && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 flex-shrink-0">
                          <Bike className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium flex-1 truncate">{pedido.motorizado}</span>
                        {pedido.celular_motorizado && (
                          <a
                            href={`tel:${pedido.celular_motorizado}`}
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 flex-shrink-0"
                          >
                            <Phone className="h-3.5 w-3.5 text-white" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  {pedido.foto_pago && (
                    <Button
                      onClick={() => setShowFotoPago(true)}
                      size="sm"
                      variant="outline"
                      className="h-10 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver pago
                    </Button>
                  )}
                </>
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
