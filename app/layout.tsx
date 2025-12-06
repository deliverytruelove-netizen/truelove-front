// app\layout.tsxss
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import ClientProviders from "./ClientProviders";

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

export const metadata: Metadata = {
  title: {
    default: "TRUE LOVE - Servicio de Entrega Excepcional",
    template: "%s | TRUE LOVE"
  },
  description: "En TRUE LOVE, nos dedicamos a ofrecer un servicio de entrega excepcional. Nuestro compromiso es llevar tus pedidos de manera segura y eficiente a su destino.",
  keywords: ["delivery", "entrega", "true love", "envíos", "logística", "paquetería"],
  authors: [{ name: "TRUE LOVE" }],
  openGraph: {
    title: "TRUE LOVE - Servicio de Entrega Excepcional",
    description: "En TRUE LOVE, nos dedicamos a ofrecer un servicio de entrega excepcional. Nuestro compromiso es llevar tus pedidos de manera segura y eficiente a su destino.",
    url: "https://deliverytruelove.com",
    siteName: "TRUE LOVE",
    locale: "es_ES",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col`}
      >
        <main className="flex-grow">
          {children}
        </main>

        <ClientProviders />
      </body>
    </html>
  );
}
