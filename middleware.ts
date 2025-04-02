// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify, SignJWT } from "jose"

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
  "/verificacion-documentos",
  "/socio-aprobado",
]

// Rutas protegidas para el proceso de registro de repartidores
const RUTAS_REPARTO_PROTEGIDAS = [
  "/reparto/zonas",
  "/reparto/documentos",
  "/reparto/entrega-material",
  "/reparto/confirmacion-entrega",
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const authToken = req.cookies.get("authToken")
  const userRole = req.cookies.get("userRole")?.value
  const registrationToken = req.cookies.get("registrationToken")?.value
  const repartoToken = req.cookies.get("repartoToken")?.value
  const esRutaAdmin = path.startsWith("/admin")
  const esRutaSocio = path.startsWith("/socio")
  const esRutaMotorizado = path.startsWith("/motorizado")
  const esPaginaLogin = path === "/login"
  const esSocioAprobado = path === "/socio-aprobado"
  const esRutaReparto = RUTAS_REPARTO_PROTEGIDAS.some((ruta) => path === ruta)

  // Verificar estado de registro en la página principal
  if (path === "/") {
    const documentNumber = req.nextUrl.searchParams.get("document")
    const email = req.nextUrl.searchParams.get("email")

    if (documentNumber || email) {
      try {
        // Crear una URL absoluta para la API
        const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_WEB}/register/check-status`)

        // Realizar la solicitud directamente sin pasar por el middleware
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentNumber,
            email,
          }),
        })

        if (!response.ok) {
          console.error("Error en la respuesta de la API:", response.status)
          return NextResponse.next()
        }

        const data = await response.json()
        console.log("Respuesta del servidor:", data)

        // Si el estado es incompleto, redirigir a la página de estado de registro
        if (data.status === "incomplete" && data.registration_id) {
          const registrationUrl = new URL("/registration-status", req.url)
          registrationUrl.searchParams.set("registration_id", data.registration_id.toString())

          console.log("Redirigiendo a:", registrationUrl.toString())
          return NextResponse.redirect(registrationUrl)
        }
      } catch (error) {
        console.error("Error al verificar el estado del registro:", error)
      }
    }
  }

  // Verificar estado de registro en la página de reparto
  if (path === "/reparto") {
    const nroDocumento = req.nextUrl.searchParams.get("document")
    const email = req.nextUrl.searchParams.get("email")

    if (nroDocumento || email) {
      try {
        // Crear una URL absoluta para la API
        const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/check-status`)

        // Realizar la solicitud directamente sin pasar por el middleware
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nroDocumento,
            email,
          }),
        })

        if (!response.ok) {
          console.error("Error en la respuesta de la API:", response.status)
          return NextResponse.next()
        }

        const data = await response.json()
        console.log("Respuesta del servidor:", data)

        // Si el estado es incompleto, redirigir a la página de estado de registro
        if (data.status === "incomplete" && data.registration_id) {
          const registrationUrl = new URL("/reparto/status", req.url)
          registrationUrl.searchParams.set("registration_id", data.registration_id.toString())

          console.log("Redirigiendo a:", registrationUrl.toString())
          return NextResponse.redirect(registrationUrl)
        }
      } catch (error) {
        console.error("Error al verificar el estado del registro:", error)
      }
    }
  }

  // Manejo especial para la ruta /socio-aprobado
  if (esSocioAprobado) {
    const registrationId = req.nextUrl.searchParams.get("registration_id")

    if (!registrationId) {
      console.log("No se encontró ID de registro")
      return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
      // Verificar si el socio está aprobado usando el ID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocios/${registrationId}/approval-status`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al verificar estado de aprobación")
      }

      const data = await response.json()

      if (!data.aprobado) {
        console.log("Socio no aprobado")
        return NextResponse.redirect(new URL("/login", req.url))
      }

      // Si el socio está aprobado, permitir acceso
      return NextResponse.next()
    } catch (error) {
      console.error("Error al verificar aprobación:", error)
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Lógica para rutas de admin, socio, motorizado y login
  if (authToken && esPaginaLogin) {
    console.log("Usuario ya autenticado, redirigiendo al dashboard correspondiente")
    switch (userRole) {
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      case "negocio":
        return NextResponse.redirect(new URL("/socio/admin", req.url))
      case "motorizado":
        return NextResponse.redirect(new URL("/motorizado/admin", req.url))
      default:
        return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Verificar acceso a rutas protegidas por rol
  if (!authToken && (esRutaAdmin || esRutaSocio || esRutaMotorizado)) {
    console.log("Intento de acceso no autorizado, redirigiendo al login")
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Verificar que el usuario tenga el rol correcto para acceder a las rutas
  if (authToken) {
    if (esRutaAdmin && userRole !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (esRutaSocio && userRole !== "negocio") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (esRutaMotorizado && userRole !== "motorizado") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Lógica para las rutas protegidas del proceso de registro
  if (RUTAS_PROTEGIDAS.includes(path) && path !== "/socio-aprobado") {
    if (!registrationToken) {
      console.log("No se encontró token de registro, redirigiendo al inicio")
      return NextResponse.redirect(new URL("/", req.url))
    }

    try {
      // Verificar el token de registro
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(registrationToken, secretKey)

      // Verificar que el token contiene la información necesaria
      if (!payload.registration_id || !payload.current_step) {
        throw new Error("Token inválido")
      }

      const currentStepIndex = RUTAS_PROTEGIDAS.indexOf(payload.current_step as string)
      const requestedStepIndex = RUTAS_PROTEGIDAS.indexOf(path)

      // Permitir acceso solo si es el paso actual o el siguiente
      if (requestedStepIndex > currentStepIndex + 1) {
        console.log("Intento de saltar pasos, redirigiendo al paso actual")
        return NextResponse.redirect(new URL(payload.current_step as string, req.url))
      }

      if (requestedStepIndex < currentStepIndex) {
        const updatedToken = await updateRegistrationToken(registrationToken, path)
        const response = NextResponse.next()
        response.cookies.set("registrationToken", updatedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        return response
      }
    } catch (error) {
      console.error("Error al verificar el token de registro:", error)
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Lógica para las rutas protegidas del proceso de registro de repartidores
  if (esRutaReparto) {
    if (!repartoToken) {
      console.log("No se encontró token de reparto, redirigiendo al inicio")
      return NextResponse.redirect(new URL("/reparto", req.url))
    }

    try {
      // Verificar el token de reparto
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(repartoToken, secretKey)

      // Verificar que el token contiene la información necesaria
      if (!payload.registration_id || !payload.current_step) {
        throw new Error("Token inválido")
      }

      const currentStepIndex = RUTAS_REPARTO_PROTEGIDAS.indexOf(payload.current_step as string)
      const requestedStepIndex = RUTAS_REPARTO_PROTEGIDAS.indexOf(path)

      // Permitir acceso solo si es el paso actual o el siguiente
      if (requestedStepIndex > currentStepIndex + 1) {
        console.log("Intento de saltar pasos, redirigiendo al paso actual")
        return NextResponse.redirect(new URL(payload.current_step as string, req.url))
      }

      if (requestedStepIndex < currentStepIndex) {
        const updatedToken = await updateRepartoToken(repartoToken, path)
        const response = NextResponse.next()
        response.cookies.set("repartoToken", updatedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        return response
      }
    } catch (error) {
      console.error("Error al verificar el token de reparto:", error)
      return NextResponse.redirect(new URL("/reparto", req.url))
    }
  }

  // Para todos los demás casos, continuar con la solicitud
  return NextResponse.next()
}

async function updateRegistrationToken(token: string, newStep: string): Promise<string> {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
  const { payload } = await jwtVerify(token, secretKey)

  const updatedPayload = { ...payload, current_step: newStep }

  const updatedToken = await new SignJWT(updatedPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey)

  return updatedToken
}

async function updateRepartoToken(token: string, newStep: string): Promise<string> {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
  const { payload } = await jwtVerify(token, secretKey)

  const updatedPayload = { ...payload, current_step: newStep }

  const updatedToken = await new SignJWT(updatedPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey)

  return updatedToken
}

export const config = {
  matcher: [
    "/",
    "/reparto",
    "/reparto/zonas",
    "/reparto/documentos",
    "/reparto/entrega-material",
    "/reparto/confirmacion-entrega",
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
    "/verificacion-documentos",
    "/socio-aprobado",
    "/registration-status",
    "/reparto/status",
  ],
}

