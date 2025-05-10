"use client"

import {createContext, useContext, type ReactNode } from "react"
import type { IconType } from "react-icons"
import { RiDashboardLine,RiShieldUserLine, RiRidingFill, RiAncientGateLine , RiBankCardFill, RiCalendar2Fill  } from "react-icons/ri"

export interface NavItem { 
    title: string
    path : string
    icon : IconType
}
interface NavigationContextType {
    navItems: NavItem[]
}
const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// lista de navegacion que se usa tanto en el sidebar como en el searchbox
export const navigationItems: NavItem [] = [
    {
        title: "Dashboard",
        path  : "/admin/dashboard",
        icon: RiDashboardLine,
    },
    {
        title: "Usuarios",
        path : "/admin/usuarios",
        icon : RiShieldUserLine,
    
    } ,
    {
        title : "socios",
        path : "/admin/socios",
        icon : RiShieldUserLine,
    },
    {
        title : "Motorizados",
        path : "/admin/motorizado",
        icon : RiRidingFill,
    },
    {
        title : "Locales",
        path : "/admin/locales",
        icon : RiAncientGateLine,
    },
    {
        title : "Califcaciones",
        path : "/admin/local-rating",
        icon : RiAncientGateLine,
    },
    {
        title : "Promociones",
        path : "/admin/promociones",
        icon : RiShieldUserLine,
    },
    // {
    //     title : "Descuentos",
    //     path : "/admin/promociones",
    //     icon : RiCoupon3Line,
    // },
    {
        title : "Merodos De Pagos",
        path : "/admin/metodo-pago",
        icon : RiBankCardFill ,
    },
    {
        title : "Horarios",
        path : "/admin/horarios",
        icon : RiCalendar2Fill ,
    },
]

export const NavigationProvider = ({children}: {children: ReactNode})=> {
    return (
            <NavigationContext.Provider value={{ navItems: navigationItems}}>{children} </NavigationContext.Provider>
    )
}

export const useNavigation = () => {
    const context = useContext(NavigationContext)

    if (context === undefined) {
        throw new Error("useNavigation must be used within a NavigationProvider")
    }
    return context
 }