// app\socio\admin\components\perfil-negocio.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Clock, Upload, Plus, Calendar, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HorarioModal } from "./horario-modal";
import logoPerfil from "@/src/assets/img/logotipo.png";

interface HorarioNegocio {
  id: number;
  nombre: string;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
  hora_apertura: string;
  hora_cierre: string;
  activo: boolean;
}

interface PerfilNegocioProps {
  logo?: string;
  banner?: string;
  horarios: HorarioNegocio[];
  business?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export function PerfilNegocio({
  logo,
  banner,
  horarios: horariosIniciales,
}: PerfilNegocioProps) {
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoBanner, setSubiendoBanner] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<HorarioNegocio[]>(horariosIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);

  const obtenerPerfil = useCallback(async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!token) {
        setLogoUrl(logo);
        setBannerUrl(banner);
        return;
      }

      const respuesta = await fetch(`${API_URL}/negocio/logo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setLogoUrl(datos.ruta_logo || logo);
        setBannerUrl(datos.banner || banner);
        if (datos.horarios) {
          setHorarios(datos.horarios);
        }
      } else {
        setLogoUrl(logo);
        setBannerUrl(banner);
      }
    } catch (error) {
      console.error("Error al obtener el perfil:", error);
      setLogoUrl(logo);
      setBannerUrl(banner);
    }
  }, [logo, banner]);

  useEffect(() => {
    obtenerPerfil();
  }, [obtenerPerfil]);

  const manejarSubidaLogo = async (
    evento: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (evento.target.files && evento.target.files[0]) {
      const archivo = evento.target.files[0];
      setSubiendoLogo(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("logo", archivo);

        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        const respuesta = await fetch(`${API_URL}/negocio/logo`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.message || "Error al subir el logo");
        }

        const datos = await respuesta.json();
        setLogoUrl(datos.ruta_logo);
      } catch (error: unknown) {
        console.error("Error al subir el logo:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Error al subir el logo");
        }
      } finally {
        setSubiendoLogo(false);
      }
    }
  };

  const manejarSubidaBanner = async (
    evento: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (evento.target.files && evento.target.files[0]) {
      const archivo = evento.target.files[0];

      // Validar archivo antes de subirlo
      const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!tiposPermitidos.includes(archivo.type)) {
        setError("Solo se permiten archivos JPG, PNG y GIF.");
        evento.target.value = ""; // Limpiar el input
        return;
      }

      // Verificar tamaño del archivo (4MB)
      const tamañoMaximo = 4 * 1024 * 1024; // 4MB
      if (archivo.size > tamañoMaximo) {
        setError("El archivo es demasiado grande. Máximo 4MB permitido.");
        evento.target.value = ""; // Limpiar el input
        return;
      }

      setSubiendoBanner(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("banner", archivo);

        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        console.log("Enviando banner:", {
          fileName: archivo.name,
          fileType: archivo.type,
          fileSize: archivo.size,
        });

        const respuesta = await fetch(`${API_URL}/negocio/banner`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          console.error("Error del servidor:", errorData);
          throw new Error(errorData.message || "Error al subir el banner");
        }

        const datos = await respuesta.json();
        setBannerUrl(datos.banner);
        setError(null);
      } catch (error: unknown) {
        console.error("Error al subir el banner:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Error al subir el banner");
        }
      } finally {
        setSubiendoBanner(false);
        // Limpiar el input
        evento.target.value = "";
      }
    }
  };

  const guardarHorario = async (horarioNuevo: Omit<HorarioNegocio, "id">) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const respuesta = await fetch(`${API_URL}/negocio/horarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(horarioNuevo),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || "Error al guardar el horario");
      }

      const horarioGuardado = await respuesta.json();
      setHorarios([...horarios, horarioGuardado]);
      setModalAbierto(false);
    } catch (error: unknown) {
      console.error("Error al guardar horario:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error al guardar el horario");
    }
  };

  const obtenerDiasString = (horario: HorarioNegocio) => {
    const dias = [];
    if (horario.lunes) dias.push("Lun");
    if (horario.martes) dias.push("Mar");
    if (horario.miercoles) dias.push("Mié");
    if (horario.jueves) dias.push("Jue");
    if (horario.viernes) dias.push("Vie");
    if (horario.sabado) dias.push("Sáb");
    if (horario.domingo) dias.push("Dom");
    return dias.join(", ");
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Perfil del Negocio
        </h1>
      </div>

      <div className="grid gap-6 ">
        {/* Logo Section */}
        <Card className="overflow-hidden dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6 ">
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-background to-muted/50 border-2 border-muted/20 shadow-sm group hover:border-primary/20 hover:shadow-md transition-all duration-300">
                {logoUrl ? (
                  <Image
                    src={logoUrl || "/placeholder.svg"}
                    alt="Logo del negocio"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    fill
                    priority
                  />
                ) : (
                  <Image
                    src={logoPerfil || "/placeholder.svg"}
                    alt="Logo por defecto"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    fill
                    priority
                  />
                )}
              </div>

              <div className="flex flex-col gap-4 ">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Logo del Negocio
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sube el logo de tu negocio para que tus clientes puedan
                    identificarte fácilmente.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className="relative overflow-hidden bg-brand-900 shadow-lg transition-all hover:shadow-xl dark:text-gray-200"
                    disabled={subiendoLogo}
                    onClick={() =>
                      document.getElementById("input-logo")?.click()
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-/10 to-transparent opacity-0 transition-opacity hover:opacity-100 " />
                    <Upload className="mr-2 h-5 w-5" />
                    {subiendoLogo ? "Subiendo..." : "Actualizar Logo"}
                  </Button>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner Section */}
        <Card className="overflow-hidden dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  Banner del Negocio
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sube un banner atractivo para destacar tu negocio en la
                  plataforma.
                </p>
              </div>

              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/50 border-2 border-muted/20 shadow-sm group hover:border-primary/20 hover:shadow-md transition-all duration-300">
                {bannerUrl ? (
                  <Image
                    src={bannerUrl || "/placeholder.svg"}
                    alt="Banner del negocio"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    fill
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No hay banner configurado
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="relative overflow-hidden bg-brand-900 dark:text-gray-200 shadow-lg transition-all hover:shadow-xl"
                  disabled={subiendoBanner}
                  onClick={() =>
                    document.getElementById("input-banner")?.click()
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-/10 to-transparent opacity-0 transition-opacity hover:opacity-100" />
                  <Upload className="mr-2 h-5 w-5" />
                  {subiendoBanner ? "Subiendo..." : "Actualizar Banner"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horarios Section */}
        <Card className="overflow-hidden dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Horarios de Atención
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configura los horarios en los que tu negocio estará abierto.
                  </p>
                </div>
                <Button
                  onClick={() => setModalAbierto(true)}
                  className="relative overflow-hidden  text-primary-foreground shadow-lg transition-all hover:shadow-xl bg-red-600 hover:bg-red-700 dark:text-gray-200"
                >
                  <div className="absolute inset-0 opacity-0  hover:opacity-100 " />
                  <Plus className="mr-2 h-5 w-5 " />
                  Agregar Horario
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4">
                {horarios.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No hay horarios configurados
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comienza agregando el primer horario de atención para tu
                      negocio.
                    </p>
                    <Button
                      onClick={() => setModalAbierto(true)}
                      variant="outline"
                      className="relative overflow-hidden group dark:bg-red-900"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Primer Horario
                    </Button>
                  </div>
                ) : (
                  horarios.map((horario) => (
                    <div
                      key={horario.id}
                      className="group relative overflow-hidden rounded-xl border border-muted/30 bg-gradient-to-br from-card via-card to-muted/5 p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative flex items-center justify-between">
                        <div className="space-y-3">
                          <h4 className="text-xl font-medium tracking-tight">
                            {horario.nombre}
                          </h4>
                          <div className="flex items-center text-base">
                            <Clock className="mr-2 h-5 w-5 text-primary/70" />
                            <span className="font-medium text-muted-foreground">
                              {formatearHora(horario.hora_apertura)} -{" "}
                              {formatearHora(horario.hora_cierre)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className="rounded-lg border border-muted/50 px-3 py-1 text-sm font-medium"
                            >
                              {obtenerDiasString(horario)}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant={horario.activo ? "default" : "secondary"}
                          className={`
                            rounded-lg px-4 py-1.5 text-sm font-medium transition-colors
                            ${
                              horario.activo
                                ? "border-green-500/20 bg-green-500/10 text-green-500 group-hover:bg-green-500/20"
                                : "bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {horario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <input
        id="input-banner"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        className="hidden"
        onChange={manejarSubidaBanner}
      />
      <input
        id="input-logo"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        className="hidden"
        onChange={manejarSubidaLogo}
      />

      <HorarioModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        onGuardar={guardarHorario}
      />
    </div>
  );
}
