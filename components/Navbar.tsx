// components\Navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import Logotipo from '@/src/assets/img/logotipo.png'; 

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-[#fff] py-2 w-full top-0  shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src={Logotipo}
              alt="Logotipo"
              width={120}
              height={100}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <div className="hidden md:flex space-x-4">
            <NavLink href="#">Acerca de Nosotros</NavLink>
            {/* <NavLink href="#">Contact</NavLink> */}
            <NavLink href="/reparto">Repartos</NavLink>
          </div>

          <div className="flex items-center space-x-4">
            <Button asChild variant="default" className="bg-[#D9043D] text-white hover:bg-[#d63c30] hidden md:inline-flex">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <DialogTitle className="sr-only">Menú de navegación</DialogTitle>
                <nav className="flex flex-col space-y-4">
                  <NavLink href="/login">Iniciar Sesión</NavLink>
                  <NavLink href="#">Acerca De Nosotros</NavLink>
                  {/* <NavLink href="#">Contact</NavLink> */}
                  <NavLink href="/reparto">Repartos</NavLink>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-800 hover:text-red-500 font-bold text-sm hover:underline hover:underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}
