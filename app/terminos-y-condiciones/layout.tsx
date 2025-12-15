import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | TRUE LOVE",
  description: "Lee los términos y condiciones de uso de TRUE LOVE, la app de delivery de comida en Huacho. Conoce tus derechos y obligaciones al usar nuestra plataforma. Actualizado 2025.",
  keywords: "términos y condiciones, términos de uso, condiciones de servicio, TRUE LOVE, delivery Huacho, términos legales, app delivery Perú",
  openGraph: {
    title: "Términos y Condiciones | TRUE LOVE",
    description: "Lee los términos y condiciones de uso de TRUE LOVE, la app de delivery de comida en Huacho.",
    url: "https://deliverytruelove.com/terminos-y-condiciones",
    type: "website",
    locale: "es_ES",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
