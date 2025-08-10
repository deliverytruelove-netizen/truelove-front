// app\layout.tsx
"use client";

import localFont from "next/font/local";
import "./globals.css";


import { Toaster } from "@/components/ui/toaster";

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


  return (
    <html lang="en">
      <head>
   
        <meta name="description" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col`}>
        {/* {pathname === "/admin" ? null : <Navbar />} */}
        
        <main className="flex-grow">
          {children}
          <Toaster/>
        </main>
      </body>
    </html>
  );
}

