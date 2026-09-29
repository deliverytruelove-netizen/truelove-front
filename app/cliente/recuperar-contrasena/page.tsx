// app/cliente/recuperar-contrasena/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import {
  clienteForgotPasswordSendCode,
  clienteResetPassword,
  ClienteAuthError,
} from "@/services/clienteAuthService";

export default function ClienteRecuperarContrasenaPage() {
  const router = useRouter();
  const { login } = useClienteAuth();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await clienteForgotPasswordSendCode(email);
      setSentCode(response.verification_code);
      setClienteId(response.id);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ClienteAuthError ? err.message : "No se pudo enviar el código");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim() !== sentCode) {
      setError("El código ingresado no es correcto");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!clienteId) return;

    setIsSubmitting(true);
    try {
      const response = await clienteResetPassword(clienteId, password);
      login(response.token, response.cliente);
      router.push("/cliente/cuenta");
    } catch (err) {
      setError(err instanceof ClienteAuthError ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-4">
          <KeyRound className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-center mb-6 text-red-800">Recupera tu contraseña</h3>

        {error && <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4">{error}</div>}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">Correo electrónico</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-center text-sm text-slate-600">
              Enviamos un código a <span className="font-semibold">{email}</span>
            </p>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em]"
              required
            />
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">Nueva contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">Confirmar contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Actualizar contraseña"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600 mt-6">
          <Link href="/cliente/login" className="text-red-600 font-semibold hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
