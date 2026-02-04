// app\socio\admin\pedidos\[id]\page.tsx
"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPedidos,
  getEstadoLabel,
  formatDate,
  type Pedido,
} from "../../services/pedido.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Clock,
  Package,
  Truck,
  Bike,
  CreditCard,
  Receipt,
  FileText,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function LoadingPedido() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PedidoDetalleContent() {
  const params = useParams();
  const router = useRouter();

  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const pedidoId = Number.parseInt(id);

  const { data: pedidos = [], isLoading, isError, error } = useQuery({
    queryKey: ["pedidos", "todas"],
    queryFn: () => fetchPedidos("todas"),
  });

  const pedido = pedidos.find((p) => p.id === pedidoId);

  // Calcular totales
  const calcularTotal = (p: Pedido) => {
    const subtotal = p.detalleArray?.reduce((sum, item) => {
      return sum + parseFloat(item.precio) * item.cantidad;
    }, 0) || 0;
    const delivery = parseFloat(p.precio_delivery || "0");
    const descuento = parseFloat(p.descuento || "0");
    return subtotal + delivery - descuento;
  };

  if (isLoading) return <LoadingPedido />;

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "No se pudo cargar la información del pedido."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pedido no encontrado</AlertTitle>
          <AlertDescription>
            No se encontró el pedido con ID {pedidoId}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const estadoInfo = getEstadoLabel(pedido.estado);
  const total = calcularTotal(pedido);
  const tipoPedidoLabel = pedido.tipo_pedido === 0 ? "Delivery" : "Recojo en local";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al historial
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Pedido #{pedido.id}</h1>
            <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
            <Badge variant="outline">{tipoPedidoLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            <Clock className="h-4 w-4 inline mr-1" />
            {formatDate(pedido.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total del pedido</p>
          <p className="text-3xl font-bold text-green-600">S/ {total.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold">{pedido.cliente}</p>
                <p className="text-sm text-muted-foreground">{pedido.celular}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`tel:${pedido.celular}`)}
              >
                <Phone className="h-4 w-4 mr-1" />
                Llamar
              </Button>
            </div>
            
            {pedido.direccion_entrega && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Dirección de entrega</p>
                    <p className="text-sm text-muted-foreground">{pedido.direccion_entrega}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motorizado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bike className="h-5 w-5 text-blue-600" />
              Motorizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pedido.motorizado ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-semibold">{pedido.motorizado}</p>
                  <p className="text-sm text-muted-foreground">{pedido.celular_motorizado || "Sin teléfono"}</p>
                </div>
                {pedido.celular_motorizado && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`tel:${pedido.celular_motorizado}`)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Llamar
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin motorizado asignado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-600" />
              Productos del pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pedido.detalleArray && pedido.detalleArray.length > 0 ? (
              <div className="space-y-2">
                {pedido.detalleArray.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-600">{item.cantidad}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.nombre}</p>
                        {item.tipo === "adicional" && (
                          <Badge variant="secondary" className="text-xs">Adicional</Badge>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold tabular-nums">
                      S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}

                {/* Resumen de totales */}
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">
                      S/ {pedido.detalleArray.reduce((sum, item) => sum + parseFloat(item.precio) * item.cantidad, 0).toFixed(2)}
                    </span>
                  </div>
                  {pedido.precio_delivery && parseFloat(pedido.precio_delivery) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="tabular-nums">S/ {parseFloat(pedido.precio_delivery).toFixed(2)}</span>
                    </div>
                  )}
                  {pedido.descuento && parseFloat(pedido.descuento) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento</span>
                      <span className="tabular-nums">-S/ {parseFloat(pedido.descuento).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="tabular-nums text-green-600">S/ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">{pedido.detalle || "Sin detalles disponibles"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de pago */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Método de pago</p>
              <p className="font-semibold">{pedido.tipo_pago || "Efectivo"}</p>
            </div>
            {pedido.tipo_comprobante && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground">Comprobante</p>
                <p className="font-semibold">{pedido.tipo_comprobante}</p>
                {pedido.documento && (
                  <p className="text-sm text-muted-foreground">{pedido.documento}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Local */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-600" />
              Local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-semibold">{pedido.local}</p>
              <p className="text-sm text-muted-foreground">{pedido.direccion_local}</p>
            </div>
          </CardContent>
        </Card>

        {/* Nota del cliente */}
        {pedido.nota && pedido.nota !== "Sin nota" && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                Nota del cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="italic">{pedido.nota}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estado de entrega */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <p className="font-semibold text-green-800 dark:text-green-200">Pedido Entregado</p>
              <p className="text-sm text-green-600">
                Completado el {formatDate(pedido.updated_at || pedido.created_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón volver */}
      <div className="flex justify-center pt-4">
        <Button onClick={() => router.back()} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Historial
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingPedido />}>
      <PedidoDetalleContent />
    </Suspense>
  );
}
