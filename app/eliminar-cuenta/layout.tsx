import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eliminar mi Cuenta de Cliente | TRUE LOVE",
  description: "¿Necesitas eliminar tu cuenta de cliente en TRUE LOVE? Solicita la eliminación de forma segura. Proceso verificado mediante código de confirmación enviado a tu correo electrónico.",
  keywords: [
    "eliminar cuenta true love",
    "borrar cuenta true love",
    "eliminar mi cuenta delivery",
    "eliminar datos personales true love",
    "solicitar eliminación cuenta",
    "borrar mi información true love",
    "eliminar perfil cliente",
  ],
  openGraph: {
    title: "Eliminar Cuenta de Cliente - TRUE LOVE",
    description: "Solicita la eliminación de tu cuenta de cliente TRUE LOVE de forma segura y verificada.",
    url: "https://deliverytruelove.com/eliminar-cuenta",
    type: "website",
  },
  robots: {
    index: true, // Ahora SÍ se indexará en Google
    follow: true,
  },
  alternates: {
    canonical: "https://deliverytruelove.com/eliminar-cuenta",
  },
};

export default function EliminarCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
