"use client"; // Asegúrate de incluir esta línea

import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { usePathname } from "next/navigation"; 
import { metadata } from "./metadata"; // Asegúrate de que esta ruta sea correcta

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Obtener la ruta actual

  return (
    <html lang="en">
      <head>
        {/* Asegúrate de incluir el uso de metadata aquí */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {pathname === "/admin/login" ? null : <Navbar />} {/* Condición para mostrar el Navbar */}
        {children}
      </body>
    </html>
  );
}
