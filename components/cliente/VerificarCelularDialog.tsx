// components/cliente/VerificarCelularDialog.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Pencil, RefreshCw, Smartphone, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  enviarCodigoCelular,
  estadoEnvioCodigo,
  VerificacionError,
  type EnvioCodigo,
} from "@/services/clienteVerificacionService";

export type ResultadoVerificacion = "verificado" | "omitido" | "cancelado";

export interface RespuestaVerificacion {
  resultado: ResultadoVerificacion;
  /** Código que escribió el cliente: el servidor lo comprueba después. */
  codigo?: string;
}

interface Props {
  numero: string;
  onResult: (r: RespuestaVerificacion) => void;
}

const formatearNumero = (n: string) => (n.length === 9 ? `+51 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : `+51 ${n}`);

export default function VerificarCelularDialog({ numero, onResult }: Props) {
  const [envio, setEnvio] = useState<EnvioCodigo | null>(null);
  const [enviando, setEnviando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codigoMalo, setCodigoMalo] = useState(false);
  const [valor, setValor] = useState("");
  const [espera, setEspera] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const sondeo = useRef<ReturnType<typeof setInterval> | null>(null);
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null);
  const cerrado = useRef(false);

  const detener = useCallback(() => {
    if (sondeo.current) clearInterval(sondeo.current);
    if (reloj.current) clearInterval(reloj.current);
  }, []);

  const terminar = useCallback(
    (r: RespuestaVerificacion) => {
      if (cerrado.current) return;
      cerrado.current = true;
      detener();
      onResult(r);
    },
    [detener, onResult]
  );

  const iniciarEspera = useCallback((segundos: number) => {
    if (reloj.current) clearInterval(reloj.current);
    setEspera(segundos);
    reloj.current = setInterval(() => {
      setEspera((e) => {
        if (e <= 1) {
          if (reloj.current) clearInterval(reloj.current);
          return 0;
        }
        return e - 1;
      });
    }, 1000);
  }, []);

  const vigilarEntrega = useCallback((envioId: number) => {
    if (sondeo.current) clearInterval(sondeo.current);
    let intentos = 0;
    sondeo.current = setInterval(async () => {
      intentos++;
      if (intentos > 15) {
        if (sondeo.current) clearInterval(sondeo.current);
        return;
      }
      const estado = await estadoEnvioCodigo(envioId);
      if (!estado) return;
      if (estado.entregado) {
        if (sondeo.current) clearInterval(sondeo.current);
      } else if (estado.fallido) {
        if (sondeo.current) clearInterval(sondeo.current);
        setError(
          estado.sinWhatsapp
            ? "Este número parece no tener WhatsApp. Revisa que esté bien escrito o cámbialo."
            : "WhatsApp no pudo entregar el código. Inténtalo de nuevo."
        );
      }
    }, 3000);
  }, []);

  const enviar = useCallback(async () => {
    setEnviando(true);
    setError(null);
    setCodigoMalo(false);
    setValor("");
    try {
      const r = await enviarCodigoCelular(numero);
      if (r.verificacionOmitida) {
        terminar({ resultado: "omitido" });
        return;
      }
      setEnvio(r);
      iniciarEspera(60);
      if (r.envioId && r.canal === "whatsapp") vigilarEntrega(r.envioId);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar el código. Inténtalo de nuevo.");
      if (e instanceof VerificacionError && e.reintentarEn) iniciarEspera(e.reintentarEn);
    } finally {
      setEnviando(false);
    }
  }, [numero, terminar, iniciarEspera, vigilarEntrega]);

  useEffect(() => {
    enviar();
    return detener;
    // Se envía una sola vez al abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comprobar = (v: string) => {
    if (v.length !== 6 || !envio?.codigo) return;
    if (v === envio.codigo) {
      terminar({ resultado: "verificado", codigo: v });
    } else {
      setCodigoMalo(true);
      setValor("");
      inputRef.current?.focus();
    }
  };

  const onCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValor(v);
    setCodigoMalo(false);
    comprobar(v);
  };

  const puedeEscribir = !enviando && !!envio?.codigo;
  const esWhatsapp = (envio?.canal ?? "whatsapp") === "whatsapp";
  const reloj_txt = `${Math.floor(espera / 60)}:${String(espera % 60).padStart(2, "0")}`;

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && terminar({ resultado: "cancelado" })}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              esWhatsapp ? "bg-[#25D366]/15 text-[#25D366]" : "bg-[#D9043D]/10 text-[#D9043D]"
            }`}
          >
            {esWhatsapp ? <MessageCircle className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
          </div>
          <DialogTitle className="text-xl font-extrabold">Verifica tu número</DialogTitle>
          <p className="text-sm text-slate-500">
            {!enviando && !envio?.codigo
              ? "No pudimos enviar el código a"
              : `Escribe el código de 6 dígitos que te enviamos por ${esWhatsapp ? "WhatsApp" : "SMS"} a`}
          </p>
          <p className="text-base font-extrabold text-slate-900 -mt-1">{formatearNumero(numero)}</p>
        </DialogHeader>

        {enviando ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando el código…
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        ) : envio?.codigo ? (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            Código enviado. Puede tardar unos segundos en llegar.
          </div>
        ) : null}

        {/* Casillas: un input invisible recibe lo que se escribe */}
        <div className="relative" onClick={() => inputRef.current?.focus()}>
          <div className="flex justify-between gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const activa = puedeEscribir && i === Math.min(valor.length, 5);
              return (
                <div
                  key={i}
                  className={`flex-1 h-14 rounded-xl border flex items-center justify-center text-2xl font-extrabold transition-colors ${
                    codigoMalo
                      ? "border-red-500 border-2 bg-red-50"
                      : activa
                        ? "border-[#D9043D] border-2 bg-white"
                        : valor[i]
                          ? "border-slate-300 bg-[#D9043D]/5"
                          : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {valor[i] ?? ""}
                </div>
              );
            })}
          </div>
          <input
            ref={inputRef}
            value={valor}
            onChange={onCambio}
            disabled={!puedeEscribir}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text"
            aria-label="Código de verificación"
          />
        </div>
        {codigoMalo && (
          <p className="text-center text-sm font-semibold text-red-600 -mt-2">
            Código incorrecto. Revísalo e inténtalo de nuevo.
          </p>
        )}

        <button
          onClick={() => comprobar(valor)}
          disabled={!puedeEscribir || valor.length !== 6}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#ef2a39] to-[#D9043D] text-white font-bold disabled:opacity-50"
        >
          Verificar
        </button>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={enviar}
            disabled={espera > 0 || enviando}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 disabled:text-slate-400"
          >
            {espera > 0 ? <Timer className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            {espera > 0 ? `Reenviar en ${reloj_txt}` : "Reenviar código"}
          </button>
          <button
            onClick={() => terminar({ resultado: "cancelado" })}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D9043D]"
          >
            <Pencil className="w-4 h-4" /> Cambiar número
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook para pedir la verificación de un número desde cualquier pantalla:
 *   const { verificar, dialog } = useVerificarCelular();
 *   const r = await verificar("931372670");   // y renderizar {dialog}
 */
export function useVerificarCelular() {
  const [pendiente, setPendiente] = useState<{
    id: number;
    numero: string;
    resolver: (r: RespuestaVerificacion) => void;
  } | null>(null);
  const contador = useRef(0);

  const verificar = useCallback(
    (numero: string) =>
      new Promise<RespuestaVerificacion>((resolver) => {
        contador.current += 1;
        setPendiente({ id: contador.current, numero, resolver });
      }),
    []
  );

  const dialog = pendiente ? (
    <VerificarCelularDialog
      key={pendiente.id}
      numero={pendiente.numero}
      onResult={(r) => {
        pendiente.resolver(r);
        setPendiente(null);
      }}
    />
  ) : null;

  return { verificar, dialog };
}
