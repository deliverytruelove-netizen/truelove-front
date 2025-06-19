// app\socio\admin\layout.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Menu,
  Home,
  Utensils,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AvatarSettings from "./components/AvatarSettings";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Providers from "./providers";
import { usePathname } from "next/navigation";
import { AdminThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
// Importamos el CSS para el modo oscuro
import "./admin-dark-mode.css";

const menuItems = [
  { name: "Inicio", href: "/socio/admin", icon: Home },
  { name: "Menú", href: "/socio/admin/menu", icon: Utensils },
  { name: "Pedidos", href: "/socio/admin/pedidos", icon: ShoppingBag },
  { name: "POS", href: "/socio/admin/pos", icon: ShoppingBag },
  { name: "Configuración", href: "/socio/admin/configuracion", icon: Settings },
];

function SocioAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-[280px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
              isCollapsed && "mx-auto"
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
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(`${item.href}/`) &&
                  item.href !== "/socio/admin");
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200",
                        isCollapsed
                          ? "px-0 justify-center h-10 w-10 mx-auto"
                          : "px-3",
                        isActive &&
                          "bg-brand-50 dark:bg-brand-950 text-brand-700  hover:bg-brand-100 dark:hover:bg-gray-900 hover:text-brand-800 dark:hover:text-brand-200 font-medium dark:bg-gray-800 dark:text-gray-200"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive && "text-brand-600 dark:text-brand-400"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="ml-3 truncate">{item.name}</span>
                      )}
                    </Button>
                  </Link>
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
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-[72px]" : "md:ml-[280px]"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden rounded-full w-9 h-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AvatarSettings />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-950/50 min-h-[calc(100vh-4rem)]">
          <Providers>{children}</Providers>
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
      <SocioAdminLayoutContent>{children}</SocioAdminLayoutContent>
    </AdminThemeProvider>
  );
}
