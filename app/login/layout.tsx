import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión - Portal de Socios",
  description: "Accede al portal de socios de TRUE LOVE. Gestiona tu negocio, monitorea ventas, actualiza tu menú y horarios, y ofrece promociones a tus clientes.",
  keywords: ["login socio", "portal socios", "true love", "iniciar sesión negocio", "panel socios"],
  robots: {
    index: false, // No indexar páginas de login
    follow: true,
  },
  openGraph: {
    title: "Portal de Socios - TRUE LOVE",
    description: "Transforma tu negocio con True Love Portal. Accede a información valiosa y herramientas para mejorar tus ventas.",
    url: "https://deliverytruelove.com/login",
    type: "website",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
