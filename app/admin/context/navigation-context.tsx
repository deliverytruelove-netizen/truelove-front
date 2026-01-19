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
  RiUser2Line
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
    title: "socios",
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
    title: "Prioridad Locales",
    path: "/admin/locales",
    icon: RiAncientGateLine,
  },
  {
    title: "Califcaciones",
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
    title: "Metodos De Pagos",
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
    title: "kilómetros de la tarifa",
    path: "/admin/kilometros-tarifa",
    icon: RiAncientGateLine,
  },
  {
    title: "Cuotas Socios",
    path: "/admin/cuotas-socios",
    icon: RiShieldUserLine,
  },
  {
    title: "Tipos de Negocio",
    path: "/admin/tiposNegocio",
    icon: RiShieldUserLine,
  },
  {
    title: "Solicitudes Eliminación",
    path: "/admin/solicitudes-eliminacion",
    icon: RiDeleteBin6Line,
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
