// app\socio\admin\layout.tsx
"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import {
  Menu,
  Home,
  Utensils,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Smartphone,
  AlertCircle,
  Clock,
  X,
  Bell,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AvatarSettings from "./components/AvatarSettings";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Providers from "./providers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
// Importamos el CSS para el modo oscuro
import "./admin-dark-mode.css";
import {
  verificarAcceso,
  fetchMisPeriodos,
} from "./cuotas/services/pago-cuota.service";
import type {
  VerificarAccesoResponse,
  Periodo,
} from "./cuotas/types/pago-cuota.types";
import PantallaBloqueoCuota from "./cuotas/components/PantallaBloqueoCuota";
import {
  PedidosRealtimeProvider,
  usePedidosRealtimeContext,
} from "./context/PedidosRealtimeContext";
import { Switch } from "@/components/ui/switch";
import { socioService } from "./services/socio.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const menuItems = [
  { name: "Inicio", href: "/socio/admin", icon: Home },
  { name: "Menú", href: "/socio/admin/menu", icon: Utensils },
  { name: "Pedidos Activos", href: "/socio/admin/pedidos-activos", icon: Bell },
  { name: "Historial", href: "/socio/admin/pedidos", icon: History },
  {
    name: "Acerca negocio",
    icon: ShoppingBag,
    submenu: [
      { name: "POS", href: "/socio/admin/pos", icon: CreditCard },
      {
        name: "Número Digital",
        href: "/socio/admin/num-negocio",
        icon: Smartphone,
      },
    ],
  },
  { name: "Información", href: "/socio/admin/info-socio", icon: ShoppingBag },

  { name: "Configuración", href: "/socio/admin/configuracion", icon: Settings },
  { name: "Cuota", href: "/socio/admin/cuotas", icon: Settings },
];

function SocioAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [accesoInfo, setAccesoInfo] = useState<VerificarAccesoResponse | null>(
    null,
  );
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loadingAcceso, setLoadingAcceso] = useState(true);
  const [showBannerVencimiento, setShowBannerVencimiento] = useState(true);
  const pathname = usePathname();
  const { pedidosPendientes } = usePedidosRealtimeContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para el toggle de activar/desactivar local
  const [localActivo, setLocalActivo] = useState<boolean>(true);
  const [localId, setLocalId] = useState<number | null>(null);
  const [togglingLocal, setTogglingLocal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingActivoState, setPendingActivoState] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Cargar estado del local
  useEffect(() => {
    const cargarEstadoLocal = async () => {
      try {
        const response = await socioService.getProfile();
        if (response.status === "success" && response.data) {
          setLocalId(response.data.id);
          setLocalActivo(response.data.activo ?? true);
        }
      } catch (error) {
        console.error("Error al cargar estado del local:", error);
      }
    };

    cargarEstadoLocal();
  }, []);

  // Manejar cambio de estado del local
  const handleToggleLocal = (checked: boolean) => {
    setPendingActivoState(checked);
    setShowConfirmDialog(true);
  };

  const confirmarCambioEstado = async () => {
    if (localId === null || pendingActivoState === null) return;

    try {
      setTogglingLocal(true);
      await socioService.actualizarEstadoLocal(localId, pendingActivoState);
      setLocalActivo(pendingActivoState);
    } catch (error) {
      console.error("Error al actualizar estado del local:", error);
    } finally {
      setTogglingLocal(false);
      setShowConfirmDialog(false);
      setPendingActivoState(null);
    }
  };

  // Verificar acceso cuando se monta el layout
  useEffect(() => {
    const verificarAccesoSocio = async () => {
      try {
        const [accesoData, periodosData] = await Promise.all([
          verificarAcceso(),
          fetchMisPeriodos(),
        ]);
        setAccesoInfo(accesoData);
        setPeriodos(periodosData);
      } catch (error) {
        console.error("Error al verificar acceso:", error);
      } finally {
        setLoadingAcceso(false);
      }
    };

    verificarAccesoSocio();
  }, []);

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName],
    );
  };

  const isSubmenuExpanded = (menuName: string) => {
    return expandedMenus.includes(menuName);
  };

  // Mostrar loading mientras verifica acceso
  if (loadingAcceso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de bloqueo si no tiene acceso
  // PERO permitir acceso temporal a la página de cuotas para que pueda pagar
  if (accesoInfo && !accesoInfo.can_access) {
    const enPaginaCuotas = pathname === "/socio/admin/cuotas";
    const tieneAccesoTemporal = searchParams.get("acceso_temporal") === "true";

    // Si está en la página de cuotas Y tiene acceso temporal, mostrar el contenido
    if (enPaginaCuotas && tieneAccesoTemporal) {
      // Permitir ver la página de cuotas con un banner de advertencia
      return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950/50 transition-colors overflow-x-hidden">
          {/* Main Content sin sidebar */}
          <div className="flex-1 w-full">
            {/* Header con advertencia */}
            <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 sm:px-6 lg:px-8 py-4 shadow-lg">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold mb-1">
                      ⚠️ Acceso Temporal para Pagos
                    </h2>
                    <p className="text-sm sm:text-base text-red-50">
                      Tu acceso está suspendido. Sube tu comprobante de pago
                      aquí. Una vez aprobado, tu acceso será restaurado.
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-950/50 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>
      );
    }

    // Si NO está en cuotas O no tiene acceso temporal, mostrar pantalla de bloqueo
    const periodosVencidos = periodos.filter((p) => p.estado === "vencido");
    return (
      <PantallaBloqueoCuota
        periodosVencidos={periodosVencidos}
        mensaje={accesoInfo.message ?? ""}
        diasVencimiento={accesoInfo.dias_vencimiento ?? 0}
        onIrAPagar={() => {
          router.push("/socio/admin/cuotas?acceso_temporal=true");
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950/50 transition-colors overflow-x-hidden max-w-[100vw]">
      {/* Overlay para móvil y tablet */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-[280px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Panel Socio
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "p-0 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800",
              isCollapsed && "mx-auto",
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              // Si el item tiene submenu, verificamos si algún subitem está activo
              const isActive = item.submenu
                ? item.submenu.some(
                    (subitem) =>
                      pathname === subitem.href ||
                      (pathname.startsWith(`${subitem.href}/`) &&
                        subitem.href !== "/socio/admin"),
                  )
                : pathname === item.href ||
                  (pathname.startsWith(`${item.href}/`) &&
                    item.href !== "/socio/admin");

              const hasSubmenu = !!item.submenu;
              const isExpanded = isSubmenuExpanded(item.name);

              return (
                <li key={item.name}>
                  {hasSubmenu ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => !isCollapsed && toggleSubmenu(item.name)}
                        className={cn(
                          "w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200",
                          isCollapsed
                            ? "px-0 justify-center h-10 w-10 mx-auto"
                            : "px-3",
                          isActive &&
                            "bg-brand-50 dark:bg-brand-950 text-brand-700 hover:bg-brand-100 dark:hover:bg-gray-900 hover:text-brand-800 dark:hover:text-brand-200 font-medium dark:bg-gray-800 dark:text-gray-200",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive && "text-brand-600 dark:text-brand-400",
                          )}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3 truncate flex-1 text-left">
                              {item.name}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            )}
                          </>
                        )}
                      </Button>

                      {/* Submenu */}
                      {!isCollapsed && hasSubmenu && isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.submenu.map((subitem) => {
                            const isSubActive =
                              pathname === subitem.href ||
                              (pathname.startsWith(`${subitem.href}/`) &&
                                subitem.href !== "/socio/admin");

                            return (
                              <li key={subitem.name}>
                                <Link href={subitem.href}>
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 px-3 py-2 h-9",
                                      isSubActive &&
                                        "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-gray-900 hover:text-brand-700 dark:hover:text-brand-300 font-medium",
                                    )}
                                  >
                                    <subitem.icon
                                      className={cn(
                                        "h-4 w-4 shrink-0",
                                        isSubActive &&
                                          "text-brand-600 dark:text-brand-400",
                                      )}
                                    />
                                    <span className="ml-3 truncate text-sm">
                                      {subitem.name}
                                    </span>
                                  </Button>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "relative w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200",
                          isCollapsed
                            ? "px-0 justify-center h-10 w-10 mx-auto"
                            : "px-3",
                          isActive &&
                            "bg-brand-50 dark:bg-brand-950 text-brand-700 hover:bg-brand-100 dark:hover:bg-gray-900 hover:text-brand-800 dark:hover:text-brand-200 font-medium dark:bg-gray-800 dark:text-gray-200",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive && "text-brand-600 dark:text-brand-400",
                          )}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3 truncate flex-1 text-left">
                              {item.name}
                            </span>
                            {item.name === "Pedidos Activos" &&
                              pedidosPendientes.length > 0 && (
                                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                  {pedidosPendientes.length}
                                </span>
                              )}
                          </>
                        )}
                        {isCollapsed &&
                          item.name === "Pedidos Activos" &&
                          pedidosPendientes.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                              {pedidosPendientes.length}
                            </span>
                          )}
                      </Button>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modo Socio
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    v1.0.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out min-w-0 overflow-x-hidden",
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]",
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden rounded-full w-9 h-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <h1 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Toggle Activar/Desactivar Local */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-xs sm:text-sm font-medium ${localActivo ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {localActivo ? 'Activo' : 'Inactivo'}
                </span>
                <Switch
                  checked={localActivo}
                  onCheckedChange={handleToggleLocal}
                  disabled={togglingLocal || localId === null}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <ThemeToggle />
              <AvatarSettings />
            </div>
          </div>
        </header>

        {/* Dialog de confirmación para cambio de estado */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingActivoState
                  ? "¿Estás seguro de activar el local? Los clientes podrán ver tu negocio y realizar pedidos."
                  : "¿Estás seguro de desactivar el local? Los clientes no podrán ver tu negocio ni realizar pedidos."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={togglingLocal}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmarCambioEstado}
                disabled={togglingLocal}
                className={pendingActivoState ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {togglingLocal ? "Guardando..." : "Confirmar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Banner de Vencimiento Próximo */}
        {accesoInfo?.motivo === "proximo_vencimiento" &&
          showBannerVencimiento && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-yellow-200 dark:border-yellow-800 sticky top-16 z-20">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                        ⏰ Tu cuota vence en {accesoInfo.dias_vencimiento}{" "}
                        {accesoInfo.dias_vencimiento === 1 ? "día" : "días"}
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                        Recuerda realizar tu pago antes del vencimiento para
                        evitar suspensión de acceso.
                      </p>
                    </div>
                    <Link href="/socio/admin/cuotas">
                      <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-500 dark:hover:bg-yellow-600"
                      >
                        Pagar Ahora
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-full"
                    onClick={() => setShowBannerVencimiento(false)}
                  >
                    <X className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </Button>
                </div>
              </div>
            </div>
          )}

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6 bg-gray-50/50 dark:bg-gray-950/50 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SocioAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider defaultTheme="light">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        }
      >
        <Providers>
          <PedidosRealtimeProvider>
            <SocioAdminLayoutContent>{children}</SocioAdminLayoutContent>
          </PedidosRealtimeProvider>
        </Providers>
      </Suspense>
    </AdminThemeProvider>
  );
}
