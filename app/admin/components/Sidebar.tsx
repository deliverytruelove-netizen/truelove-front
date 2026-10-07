// app\admin\components\Sidebar.tsx
"use client"
import Logo from "@/public/logo.png"
import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine, RiMenu3Line } from "react-icons/ri"
import { navigationGroups, navigationItems } from "../context/navigation-context"

interface Props {
  showSidebar: boolean
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
  openSidebarRef: React.MutableRefObject<HTMLButtonElement | null>
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export const Sidebar: React.FC<Props> = ({ showSidebar, setShowSidebar, openSidebarRef, collapsed, setCollapsed }) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  const matchPath = (path: string): boolean => {
    return pathname === path
  }

  const closeSidebar = useCallback((): void => {
    setShowSidebar(false)
  }, [setShowSidebar])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
    // Disparar un evento personalizado para notificar el cambio de estado del sidebar
    window.dispatchEvent(new CustomEvent("sidebarStateChange", { detail: { collapsed: !collapsed } }))
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      if (
        sidebarRef.current !== null &&
        !(sidebarRef.current?.contains(e.target as Node) ?? false) &&
        !(openSidebarRef.current?.contains(e.target as Node) ?? false)
      ) {
        setShowSidebar(false)
      }
    }

    window.addEventListener("click", handleOutsideClick)

    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [setShowSidebar, openSidebarRef])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  const navItemClass = (path: string) => {
    return matchPath(path)
      ? `bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-lg p-3 font-medium transition-all duration-300`
      : `flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-lg p-3 text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-all duration-200`
  }

  const mainNavItems = navigationItems.filter((item) => item.path === "/admin/dashboard")

  // Grupos con sus items resueltos
  const groups = useMemo(
    () =>
      navigationGroups.map((g) => ({
        title: g.title,
        items: g.paths
          .map((path) => navigationItems.find((item) => item.path === path))
          .filter((item): item is (typeof navigationItems)[number] => Boolean(item)),
      })),
    []
  )

  // Grupo abierto: el de la página actual; el resto, plegados
  const grupoActual = groups.find((g) => g.items.some((i) => pathname.startsWith(i.path)))?.title
  const [abiertos, setAbiertos] = useState<string[]>(grupoActual ? [grupoActual] : [])

  useEffect(() => {
    if (grupoActual) setAbiertos((prev) => (prev.includes(grupoActual) ? prev : [...prev, grupoActual]))
  }, [grupoActual])

  const alternarGrupo = (titulo: string) =>
    setAbiertos((prev) => (prev.includes(titulo) ? prev.filter((t) => t !== titulo) : [...prev, titulo]))

  return (
    <div
      data-sidebar
      className={`fixed flex flex-col top-0 ${
        showSidebar ? "left-0 shadow-xl" : "-left-full lg:left-0"
      } bg-white h-full transition-all duration-300 z-20 border-r border-gray-100 ${collapsed ? "w-20" : "w-64"}`}
      ref={sidebarRef}
    >
      {/* Logo */}
      <div className={`pt-6 pb-8 flex items-center ${collapsed ? "justify-center" : "justify-between px-6"}`}>
        {!collapsed && (
          <span className="flex gap-3 items-center">
            <Image
              src={Logo || "/placeholder.svg"}
              alt="Logo of the app"
              width={40}
              height={40}
              className="brightness-[1.2]"
            />
            <span className="text-gray-800 font-bold text-lg tracking-wide">TrueLove</span>
          </span>
        )}
        {collapsed && (
          <Image
            src={Logo || "/placeholder.svg"}
            alt="Logo of the app"
            width={40}
            height={40}
            className="brightness-[1.2]"
          />
        )}
        {!collapsed && (
          <button onClick={closeSidebar} className="lg:hidden text-gray-500 hover:text-red-600 transition-colors">
            <RiMenu3Line className="text-2xl" />
          </button>
        )}
      </div>

      {/* Toggle collapse button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md text-gray-500 hover:text-red-600 transition-colors"
      >
        {collapsed ? <RiArrowRightSLine className="text-lg" /> : <RiArrowLeftSLine className="text-lg" />}
      </button>

      {/* Nav */}
      <nav className={`${collapsed ? "px-2" : "px-4"} flex flex-col gap-2 flex-1 overflow-y-auto`}>
        {!collapsed && <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">Principal</div>}

        {/* Renderizar elementos de navegación principal */}
        {mainNavItems.map((item) => (
          <Link key={item.path} href={item.path} className={navItemClass(item.path)} title={item.title}>
            <item.icon className="text-xl" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}

        {groups.map((group) => {
          const abierto = abiertos.includes(group.title)
          const tieneActivo = group.items.some((i) => matchPath(i.path))
          return (
            <div key={group.title} className={collapsed ? "border-t border-gray-100 pt-2 mt-2" : "mt-2"}>
              {!collapsed && (
                <button
                  onClick={() => alternarGrupo(group.title)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase text-gray-400 hover:text-gray-600 transition-colors"
                  aria-expanded={abierto}
                >
                  <span className={tieneActivo ? "text-red-500" : ""}>{group.title}</span>
                  <RiArrowDownSLine className={`text-base transition-transform ${abierto ? "rotate-180" : ""}`} />
                </button>
              )}
              {/* Con el sidebar colapsado solo hay iconos: se muestran todos */}
              {(abierto || collapsed) && (
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <Link key={item.path} href={item.path} className={navItemClass(item.path)} title={item.title}>
                      <item.icon className="text-xl" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 mt-auto border-t border-gray-100 ${collapsed ? "text-center" : ""}`}>
        {!collapsed ? (
          <div className="text-xs text-gray-500 text-center">© 2025 TrueLove Admin</div>
        ) : (
          <div className="text-xs text-gray-500">©</div>
        )}
      </div>
    </div>
  )
}
