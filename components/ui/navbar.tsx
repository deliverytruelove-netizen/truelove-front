"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import Logotipo from '@/src/assets/img/logotipo.png';

interface NavbarProps {
  title?: string;
  children?: React.ReactNode; // Permitir que los hijos se pasen, como el botón
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <nav className="bg-[#e9eeea] py-2  w-full top-0 z-50 shadow-md ">
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

          <div className="flex items-center space-x-4">
            {children} {/* Aquí se renderiza el botón o cualquier otro componente pasado */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-500 hover:text-red-500 font-bold text-sm hover:underline hover:underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}
