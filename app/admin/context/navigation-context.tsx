"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  RiDashboardLine,
  RiShieldUserLine,
  RiRidingFill,
  RiAncientGateLine,
  RiBankCardFill,
  RiCalendar2Fill,
  RiDeleteBin6Line,
  RiUser2Line,
  RiNotification3Line,
  RiImageLine,
  RiSmartphoneLine,
  RiFileList3Line,
  RiHome4Line,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

export interface NavItem {
  title: string;
  path: string;
  icon: IconType;
}
interface NavigationContextType {
  navItems: NavItem[];
}
const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

// lista de navegacion que se usa tanto en el sidebar como en el searchbox
export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: RiDashboardLine,
  },
  {
    title: "Usuarios",
    path: "/admin/usuarios",
    icon: RiShieldUserLine,
  },
  {
    title: "Socios",
    path: "/admin/socios",
    icon: RiShieldUserLine,
  },
  {
    title: "Motorizados",
    path: "/admin/motorizado",
    icon: RiRidingFill,
  },
  {
    title: "Mis Clientes",
    path: "/admin/clientes",
    icon: RiUser2Line,
  },
  {
    title: "Pedidos",
    path: "/admin/pedidos",
    icon: RiFileList3Line,
  },
  {
    title: "Prioridad Locales",
    path: "/admin/locales",
    icon: RiAncientGateLine,
  },
  {
    title: "Fotos de Negocios",
    path: "/admin/negocios",
    icon: RiImageLine,
  },
  {
    title: "Calificaciones",
    path: "/admin/local-rating",
    icon: RiAncientGateLine,
  },
  {
    title: "Promociones",
    path: "/admin/promociones",
    icon: RiShieldUserLine,
  },
  // {
  //     title : "Descuentos",
  //     path : "/admin/promociones",
  //     icon : RiCoupon3Line,
  // },
  {
    title: "Métodos de pago",
    path: "/admin/metodo-pago",
    icon: RiBankCardFill,
  },
  {
    title: "Horarios",
    path: "/admin/horarios",
    icon: RiCalendar2Fill,
  },
  {
    title: "Cuotas Motorizados",
    path: "/admin/coutas-drivers",
    icon: RiAncientGateLine,
  },
    {
    title: "Cuotas Socios",
    path: "/admin/cuotas-socios",
    icon: RiShieldUserLine,
  },
  {
    title: "Kilómetros de la tarifa",
    path: "/admin/kilometros-tarifa",
    icon: RiAncientGateLine,
  },

  {
    title: "Tipos de Negocio",
    path: "/admin/tiposNegocio",
    icon: RiShieldUserLine,
  },
  {
    title: "Deudas de clientes",
    path: "/admin/deudas",
    icon: RiMoneyDollarCircleLine,
  },
  {
    title: "Notas de casas",
    path: "/admin/entrega-notas",
    icon: RiHome4Line,
  },
  {
    title: "Solicitudes Eliminación",
    path: "/admin/solicitudes-eliminacion",
    icon: RiDeleteBin6Line,
  },
  {
    title: "Notificaciones",
    path: "/admin/notificaciones",
    icon: RiNotification3Line,
  },
  {
    title: "Pruebas Notificaciones",
    path: "/admin/test-notificaciones",
    icon: RiNotification3Line,
  },
  {
    title: "Versiones de Apps",
    path: "/admin/app-versions",
    icon: RiSmartphoneLine,
  },
];

export interface NavGroup {
  title: string;
  /** Rutas (path) de los items del grupo, en el orden en que se muestran */
  paths: string[];
}

// Agrupación del sidebar: evita una lista larga con scroll. El Dashboard va suelto arriba.
export const navigationGroups: NavGroup[] = [
  {
    title: "Operación",
    paths: ["/admin/pedidos", "/admin/deudas", "/admin/entrega-notas", "/admin/solicitudes-eliminacion"],
  },
  {
    title: "Usuarios",
    paths: ["/admin/usuarios", "/admin/socios", "/admin/motorizado", "/admin/clientes"],
  },
  {
    title: "Negocios",
    paths: [
      "/admin/locales",
      "/admin/negocios",
      "/admin/local-rating",
      "/admin/promociones",
      "/admin/tiposNegocio",
      "/admin/horarios",
    ],
  },
  {
    title: "Pagos y tarifas",
    paths: ["/admin/metodo-pago", "/admin/coutas-drivers", "/admin/cuotas-socios", "/admin/kilometros-tarifa"],
  },
  {
    title: "Sistema",
    paths: ["/admin/notificaciones", "/admin/test-notificaciones", "/admin/app-versions"],
  },
];

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NavigationContext.Provider value={{ navItems: navigationItems }}>
      {children}{" "}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);

  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
