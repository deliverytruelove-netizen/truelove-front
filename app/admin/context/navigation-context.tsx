"use client"

import {createContext, useContext, type ReactNode } from "react"
import type { IconType } from "react-icons"
import { RiDashboardLine,RiShieldUserLine, RiRidingFill } from "react-icons/ri"

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