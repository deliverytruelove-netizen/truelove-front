import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | TRUE LOVE",
  description: "Conoce cómo recopilamos, utilizamos y protegemos tus datos personales en TRUE LOVE. Política de privacidad actualizada 2025.",
  keywords: "privacidad, datos personales, política de privacidad, GDPR, protección de datos, TRUE LOVE",
  openGraph: {
    title: "Política de Privacidad | TRUE LOVE",
    description: "Conoce cómo recopilamos, utilizamos y protegemos tus datos personales.",
    url: "https://deliverytruelove.com/politicas-de-privacidad",
    type: "website",
    locale: "es_ES",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
