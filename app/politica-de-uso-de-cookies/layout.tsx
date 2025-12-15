import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | TRUE LOVE",
  description: "Conoce cómo TRUE LOVE utiliza cookies para mejorar tu experiencia. Gestiona tus preferencias de cookies y aprende sobre los tipos de cookies que usamos. Actualizado 2025.",
  keywords: "cookies, política de cookies, privacidad, TRUE LOVE, gestión de cookies, cookies de navegación, cookies analíticas, cookies de marketing",
  openGraph: {
    title: "Política de Cookies | TRUE LOVE",
    description: "Conoce cómo TRUE LOVE utiliza cookies para mejorar tu experiencia y cómo gestionarlas.",
    url: "https://deliverytruelove.com/politica-de-uso-de-cookies",
    type: "website",
    locale: "es_ES",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
