// app/cliente/pedido-espera/[id]/page.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Phone, Upload } from "lucide-react";
import {
  fetchVerificarConfirmacion,
  uploadPaymentProof,
  VerificarConfirmacion,
} from "@/services/clienteCheckoutService";

const POLL_INTERVAL_MS = 5000;

export default function ClientePedidoEsperaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pedidoId = Number(params.id);

  const [info, setInfo] = useState<VerificarConfirmacion | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    const data = await fetchVerificarConfirmacion(pedidoId);
    if (!data) return;
    setInfo(data);

    if (!data.requiere_confirmacion) {
      if (timerRef.current) clearInterval(timerRef.current);
      router.push("/cliente/pedidos");
    }
  }, [pedidoId, router]);

  useEffect(() => {
    if (!pedidoId) return;
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pedidoId, poll]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadPaymentProof(pedidoId, file);
      setUploaded(true);
    } finally {
      setIsUploading(false);
    }
  };

  const showPaymentProof = info && !info.omitir_pago_adelantado && info.numero_local;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#D9043D] animate-spin mx-auto mb-4" />
        <h1 className="text-lg font-black text-slate-900 mb-1">Esperando confirmación del local</h1>
        <p className="text-sm text-slate-500 mb-6">
          Tu pedido #{pedidoId} supera los S/ 100. En cuanto el local confirme, empezaremos a prepararlo.
        </p>

        {showPaymentProof && (
          <div className="text-left rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-sm font-bold text-amber-800">
              Si ya pagaste por adelantado, puedes adjuntar tu comprobante (opcional):
            </p>
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <Phone className="w-4 h-4 shrink-0" />
              <span>
                {info?.tipo_pago_digital !== "Ninguno" ? `${info?.tipo_pago_digital}: ` : ""}
                {info?.numero_local} {info?.titular ? `· ${info.titular}` : ""}
              </span>
            </div>

            {uploaded ? (
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Comprobante enviado
              </p>
            ) : (
              <label className="flex items-center justify-center gap-2 h-10 rounded-lg border border-amber-300 bg-white text-amber-700 text-sm font-bold cursor-pointer hover:bg-amber-100 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Adjuntar comprobante
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
              </label>
            )}
          </div>
        )}

        <button
          onClick={() => router.push("/cliente/pedidos")}
          className="mt-6 text-sm text-slate-500 hover:underline"
        >
          Ver mis pedidos
        </button>
      </div>
    </div>
  );
}
