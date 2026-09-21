// app/cliente/registro/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, MapPin, CheckCircle2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import Logotipo from "@/src/assets/img/logotipo.png";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import {
  clienteSendCode,
  clienteRegister,
  clienteUpdateProfile,
  lookupDni,
  ClienteAuthError,
} from "@/services/clienteAuthService";
import MapComponent from "@/app/ubicar-local/components/BusinessMap";
import SearchComponent from "@/app/ubicar-local/components/Search";
import type { GoogleMapsLocation } from "@/app/ubicar-local/types/google-maps";

type Step = "email" | "otp" | "profile" | "map" | "final";

const STEPS: { key: Step; label: string }[] = [
  { key: "email", label: "Correo" },
  { key: "otp", label: "Código" },
  { key: "profile", label: "Tus datos" },
  { key: "map", label: "Ubicación" },
  { key: "final", label: "Confirmar" },
];

const DEPARTAMENTOS = ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Cusco", "Piura", "Iquitos"];

interface ProfileForm {
  nacionalidad: "Peruana" | "Extranjera";
  documento: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  genero: string;
  celular: string;
  celular_whatsapp: string;
}

function calcAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function maxAdultBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

export default function ClienteRegistroPage() {
  const router = useRouter();
  const { login } = useClienteAuth();
  const maxBirthDate = maxAdultBirthDate();

  const [step, setStep] = useState<Step>("email");
  const [error, setError] = useState<string | null>(null);
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paso 1: correo
  const [email, setEmail] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);

  // Paso 2: código
  const [otp, setOtp] = useState("");

  // Paso 3: datos personales
  const [profile, setProfile] = useState<ProfileForm>({
    nacionalidad: "Peruana",
    documento: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    genero: "Femenino",
    celular: "",
    celular_whatsapp: "",
  });
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [isLookingUpDni, setIsLookingUpDni] = useState(false);
  const [documentoTaken, setDocumentoTaken] = useState(false);

  // Resultado del registro (creado en el paso "profile")
  const [clienteId, setClienteId] = useState<number | null>(null);

  // Paso 4: ubicación
  const [location, setLocation] = useState<GoogleMapsLocation | null>(null);

  // Paso 5: datos finales
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState(DEPARTAMENTOS[0]);
  const [referencia, setReferencia] = useState("");
  const [alias, setAlias] = useState("Casa");

  useEffect(() => {
    if (location?.formatted_address) setDireccion(location.formatted_address);
  }, [location?.formatted_address]);

  // Autocompletar por DNI (Peruano, 8 dígitos)
  useEffect(() => {
    const doc = profile.documento;
    setDocumentoTaken(false);
    if (profile.nacionalidad !== "Peruana" || doc.length !== 8) {
      setFieldsLocked(false);
      return;
    }

    let cancelled = false;
    setIsLookingUpDni(true);
    lookupDni(doc)
      .then((data) => {
        if (cancelled || !data) return;
        if (data.nombres) {
          setProfile((prev) => ({
            ...prev,
            nombre: data.nombres,
            apellido: `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim(),
          }));
          setFieldsLocked(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ClienteAuthError) {
          setDocumentoTaken(true);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLookingUpDni(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile.documento, profile.nacionalidad]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailAlreadyRegistered(false);
    setIsSubmitting(true);
    try {
      const response = await clienteSendCode(email);
      setSentCode(response.verification_code);
      setStep("otp");
    } catch (err) {
      const message = err instanceof ClienteAuthError ? err.message : "No se pudo enviar el código";
      setError(message);
      setEmailAlreadyRegistered(/ya está registrado/i.test(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.trim() !== sentCode) {
      setError("El código ingresado no es correcto");
      return;
    }
    setStep("profile");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const maxDocLength = profile.nacionalidad === "Peruana" ? 8 : 15;
    if (!profile.documento || profile.documento.length > maxDocLength) {
      setError("Ingresa un número de documento válido");
      return;
    }
    if (documentoTaken) {
      setError("El DNI ya se encuentra registrado");
      return;
    }
    if (profile.nombre.trim().length < 2 || profile.apellido.trim().length < 2) {
      setError("Ingresa tu nombre y apellido completos");
      return;
    }
    if (!profile.fecha_nacimiento || calcAge(profile.fecha_nacimiento) < 18) {
      setError("Debes ser mayor de edad para registrarte");
      return;
    }
    if (!/^\d{9}$/.test(profile.celular)) {
      setError("El celular debe tener 9 dígitos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await clienteRegister({
        nombre: profile.nombre,
        apellido: profile.apellido,
        fecha_nacimiento: profile.fecha_nacimiento,
        genero: profile.genero,
        documento: profile.documento,
        nacionalidad: profile.nacionalidad,
        email,
        celular: profile.celular,
        celular_whatsapp: profile.celular_whatsapp || profile.celular,
      });
      login(response.token, response.cliente);
      setClienteId(response.cliente.id);
      setStep("map");
    } catch (err) {
      setError(err instanceof ClienteAuthError ? err.message : "No se pudo crear la cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError("Selecciona tu ubicación en el mapa o búscala arriba");
      return;
    }
    setError(null);
    setStep("final");
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clienteId || !location) return;
    if (!direccion.trim() || !referencia.trim() || !alias.trim()) {
      setError("Completa todos los campos de tu dirección");
      return;
    }

    setIsSubmitting(true);
    try {
      await clienteUpdateProfile({
        idCliente: clienteId,
        direccion,
        departamento,
        referencia,
        alias,
        celular: profile.celular,
        celular_whatsapp: profile.celular_whatsapp || profile.celular,
        // El backend espera coordinates[0]=latitud, [1]=longitud; location.center es [lng, lat].
        selectedPosition: { coordinates: [location.center[1], location.center[0]] },
      });
      router.push("/cliente/cuenta");
    } catch (err) {
      setError(err instanceof ClienteAuthError ? err.message : "No se pudo guardar tu ubicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleLocationSelect = useCallback((loc: GoogleMapsLocation) => setLocation(loc), []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <Link href="/" className="mb-8">
        <Image src={Logotipo} alt="True Love" width={130} height={48} className="h-10 w-auto object-contain" />
      </Link>

      {/* Stepper */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 mb-8 max-w-lg w-full justify-center">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < stepIndex
                    ? "bg-[#D9043D] text-white"
                    : i === stepIndex
                    ? "bg-[#D9043D] text-white ring-4 ring-[#D9043D]/20"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-500">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-10 rounded-full ${i < stepIndex ? "bg-[#D9043D]" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-5">
            {error}
            {emailAlreadyRegistered && (
              <>
                {" "}
                <Link href="/cliente/login" className="font-bold underline">
                  Inicia sesión aquí
                </Link>
              </>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <h2 className="text-xl font-black text-slate-900 text-center">¿Cuál es tu correo?</h2>
                <p className="text-sm text-slate-500 text-center">
                  Te enviaremos un código para verificar tu cuenta
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="h-11 rounded-xl"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Enviar código"}
                </button>
                <p className="text-center text-sm text-slate-500">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/cliente/login" className="text-[#D9043D] font-bold hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center">
                  <ShieldCheck className="w-12 h-12 text-[#D9043D]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 text-center">Verifica tu correo</h2>
                <p className="text-sm text-slate-500 text-center">
                  Enviamos un código de 6 dígitos a <span className="font-semibold">{email}</span>
                </p>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] h-14 rounded-xl"
                  required
                />
                <button
                  type="submit"
                  className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors"
                >
                  Verificar
                </button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-sm text-slate-500 hover:underline"
                >
                  Cambiar correo
                </button>
              </form>
            )}

            {step === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 text-center mb-1">Cuéntanos más de ti</h2>
                <p className="text-sm text-slate-500 text-center mb-4">Completa tus datos personales</p>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nacionalidad</label>
                  <select
                    name="nacionalidad"
                    value={profile.nacionalidad}
                    onChange={handleProfileChange}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="Peruana">Peruana</option>
                    <option value="Extranjera">Extranjera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Documento {isLookingUpDni && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}
                  </label>
                  <Input
                    name="documento"
                    value={profile.documento}
                    onChange={handleProfileChange}
                    maxLength={profile.nacionalidad === "Peruana" ? 8 : 15}
                    className={`h-11 rounded-xl ${documentoTaken ? "border-red-400" : ""}`}
                    required
                  />
                  {documentoTaken && (
                    <p className="mt-1 text-xs text-red-600">
                      Este DNI ya está registrado.{" "}
                      <Link href="/cliente/login" className="font-bold underline">
                        Inicia sesión
                      </Link>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1.5">
                      Nombres {fieldsLocked && <Lock className="w-3 h-3 text-slate-400" />}
                    </label>
                    <Input
                      name="nombre"
                      value={profile.nombre}
                      onChange={handleProfileChange}
                      disabled={fieldsLocked}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1.5">
                      Apellidos {fieldsLocked && <Lock className="w-3 h-3 text-slate-400" />}
                    </label>
                    <Input
                      name="apellido"
                      value={profile.apellido}
                      onChange={handleProfileChange}
                      disabled={fieldsLocked}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha de nacimiento</label>
                    <Input
                      type="date"
                      name="fecha_nacimiento"
                      value={profile.fecha_nacimiento}
                      onChange={handleProfileChange}
                      max={maxBirthDate}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Género</label>
                    <select
                      name="genero"
                      value={profile.genero}
                      onChange={handleProfileChange}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="No Binario">No Binario</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Celular</label>
                    <Input
                      name="celular"
                      value={profile.celular}
                      onChange={handleProfileChange}
                      maxLength={9}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp</label>
                    <Input
                      name="celular_whatsapp"
                      value={profile.celular_whatsapp}
                      onChange={handleProfileChange}
                      maxLength={9}
                      className="h-11 rounded-xl"
                      placeholder="Igual al celular"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || documentoTaken}
                  className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Guardar datos"}
                </button>
              </form>
            )}

            {step === "map" && (
              <form onSubmit={handleConfirmLocation} className="space-y-4">
                <div className="flex justify-center">
                  <MapPin className="w-12 h-12 text-[#D9043D]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 text-center">Confirma tu ubicación</h2>
                <p className="text-sm text-slate-500 text-center mb-2">
                  Busca tu dirección o toca el mapa para ubicarte
                </p>

                <SearchComponent onLocationSelect={handleLocationSelect} />
                <MapComponent selectedLocation={location} onLocationUpdate={handleLocationSelect} />

                <button
                  type="submit"
                  disabled={!location}
                  className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Confirmar ubicación
                </button>
              </form>
            )}

            {step === "final" && (
              <form onSubmit={handleFinish} className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 text-center mb-1">Últimos datos</h2>
                <p className="text-sm text-slate-500 text-center mb-4">
                  Revisa y completa tu dirección de entrega
                </p>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
                  <Input
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departamento</label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {DEPARTAMENTOS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Referencia</label>
                  <Input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    maxLength={100}
                    placeholder="Ej: Frente al parque, casa azul"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alias de la dirección</label>
                  <Input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Casa, Trabajo..."
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Finalizar registro"}
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
