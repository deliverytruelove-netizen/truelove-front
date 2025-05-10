"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FormularioVerificacionProps {
  email: string
  cargando: boolean
  error: string
  tiempoReenvio: number
  codigoVerificacion: string
  setCodigoVerificacion: (codigo: string) => void
  manejarVerificacion: (e: React.FormEvent) => Promise<void>
  manejarReenvio: () => Promise<void>
}

export function FormularioVerificacion({
  email,
  cargando,
  error,
  tiempoReenvio,
  codigoVerificacion,
  setCodigoVerificacion,
  manejarVerificacion,
  manejarReenvio,
}: FormularioVerificacionProps) {
  return (
    <>
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
        Te enviamos un correo electrónico de verificación
      </h2>

      <p className="text-gray-600 text-center mb-6">
        Te enviamos un correo electrónico a la dirección <span className="font-bold">{email}</span>
      </p>

      <form onSubmit={manejarVerificacion} className="w-full space-y-4">
        <div>
          <label htmlFor="codigoVerificacion" className="block text-sm font-medium text-gray-700">
            Código de verificación
          </label>
          <input
            type="text"
            id="codigoVerificacion"
            value={codigoVerificacion}
            onChange={(e) => setCodigoVerificacion(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f34739] focus:border-[#f34739]"
            placeholder="Ingrese el código de 6 dígitos"
            required
            disabled={cargando}
            maxLength={6}
            autoComplete="off"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-[#f34739] text-white hover:bg-[#d63c30] flex items-center justify-center"
          disabled={cargando || codigoVerificacion.length !== 6}
        >
          {cargando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 mt-4">
        ¿No has recibido el correo?
        <Button
          onClick={manejarReenvio}
          disabled={tiempoReenvio > 0 || cargando}
          className="ml-2 text-red-600 hover:text-red-800 bg-white hover:bg-white"
        >
          {tiempoReenvio > 0 ? `${tiempoReenvio}s` : "Reenviar código"}
        </Button>
      </div>
    </>
  )
}
