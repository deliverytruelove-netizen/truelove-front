"use client"; // Ensure this line is included

import localFont from "next/font/local";
import "./globals.css";
import { usePathname } from "next/navigation"; 
import { metadata } from "./metadata"; // Make sure the path is correct

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
}: {
  children: React.ReactNode; // Explicitly typing children as ReactNode
}) {
  const pathname = usePathname(); // Get the current pathname

  return (
    <html lang="en">
      <head>
        {/* Ensure metadata usage here */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* {pathname === "/admin" ? null : <Navbar />}  */}
        
        {/* Ajuste de padding-top en el contenedor para compensar el Navbar fijo */}
        <main style={{ paddingTop: pathname === "/admin" ? "0" : "64px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}