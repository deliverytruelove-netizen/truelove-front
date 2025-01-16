import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

// Rutas protegidas y su orden en el proceso de registro
const RUTAS_PROTEGIDAS = [
  "/email",
  "/acercaNegocio",
  "/ubicar-local",
  "/datosClaves",
  "/datosBancarios",
  "/planes",
  "/revisarDatos",
  "/cuenta-bancaria",
  "/firmar-contrato",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const authToken = req.cookies.get("authToken");
  const userRole = req.cookies.get("userRole")?.value;
  const registrationToken = req.cookies.get("registrationToken")?.value;
  const esRutaAdmin = path.startsWith("/admin");
  const esRutaSocio = path.startsWith("/socio");
  const esRutaMotorizado = path.startsWith("/motorizado");
  const esPaginaLogin = path === "/login";

  // Lógica para rutas de admin, socio, motorizado y login
  if (authToken && esPaginaLogin) {
    console.log("Usuario ya autenticado, redirigiendo al dashboard correspondiente");
    switch (userRole) {
      case 'admin':
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      case 'negocio':
        return NextResponse.redirect(new URL("/socio/admin", req.url));
      case 'motorizado':
        return NextResponse.redirect(new URL("/motorizado/admin", req.url));
      default:
        return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (!authToken && (esRutaAdmin || esRutaSocio || esRutaMotorizado)) {
    console.log("Intento de acceso no autorizado, redirigiendo al login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar que el usuario tenga el rol correcto para acceder a las rutas
  if (authToken) {
    if (esRutaAdmin && userRole !== 'admin') {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (esRutaSocio && userRole !== 'negocio') {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (esRutaMotorizado && userRole !== 'motorizado') {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Lógica para las rutas protegidas del proceso de registro
  if (RUTAS_PROTEGIDAS.includes(path)) {
    if (!registrationToken) {
      console.log("No se encontró token de registro, redirigiendo al inicio");
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      // Verificar el token de registro
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(registrationToken, secretKey);

      // Verificar que el token contiene la información necesaria
      if (!payload.registration_id || !payload.current_step) {
        throw new Error("Token inválido");
      }

      const currentStepIndex = RUTAS_PROTEGIDAS.indexOf(payload.current_step as string);
      const requestedStepIndex = RUTAS_PROTEGIDAS.indexOf(path);

      // Permitir acceso solo si es el paso actual o el siguiente
      if (requestedStepIndex > currentStepIndex + 1) {
        console.log("Intento de acceso a un paso no permitido");
        return NextResponse.redirect(new URL(payload.current_step as string, req.url));
      }

    } catch (error) {
      console.error("Error al verificar el token de registro:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Para todos los demás casos, continuar con la solicitud
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/socio/:path*",
    "/motorizado/:path*",
    "/login",
    "/email",
    "/acercaNegocio",
    "/ubicar-local",
    "/datosClaves",
    "/datosBancarios",
    "/planes",
    "/revisarDatos",
    "/cuenta-bancaria",
    "/firmar-contrato",
  ],
};