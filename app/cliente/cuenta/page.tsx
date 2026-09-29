// app/cliente/cuenta/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Store,
  Ticket,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { updateClienteField, deleteClienteAccount, ProfileFieldType } from "@/services/clienteProfileService";

interface EditableRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  field: ProfileFieldType;
  type?: "text" | "email" | "date";
  onSaved: (value: string) => void;
}

function EditableRow({ icon: Icon, label, value, field, type = "text", onSaved }: EditableRowProps) {
  const { cliente } = useClienteAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!cliente) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateClienteField(cliente.id, field, draft);
      onSaved(draft);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1.5">{label}</p>
        {error && <p className="text-xs text-red-600 mb-1.5">{error}</p>}
        <div className="flex gap-2">
          <Input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-9 text-sm"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 rounded-lg bg-[#D9043D] text-white text-xs font-bold disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar"}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setDraft(value);
              setError(null);
            }}
            className="px-3 rounded-lg bg-slate-200 text-slate-600 text-xs font-bold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 text-left group"
    >
      <Icon className="w-4 h-4 text-red-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value || "No registrado"}</p>
      </div>
      <Pencil className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
    </button>
  );
}

export default function ClienteCuentaPage() {
  const router = useRouter();
  const { cliente, isAuthenticated, isLoading, logout, refresh } = useClienteAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/cliente/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteClienteAccount(cliente.id);
      await logout();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar la cuenta");
    } finally {
      setIsDeleting(false);
    }
  };

  const quickLinks = [
    { href: "/cliente/locales", icon: Store, label: "Explorar locales", desc: "Restaurantes y negocios cerca de ti" },
    { href: "/cliente/pedidos", icon: Package, label: "Mis pedidos", desc: "Historial y seguimiento" },
    { href: "/cliente/cupones", icon: Ticket, label: "Mis cupones", desc: "Descuentos disponibles" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {cliente.nombre} {cliente.apellido}
              </h1>
              <p className="text-sm text-slate-500">Cuenta de cliente True Love</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <EditableRow
              icon={Mail}
              label="Correo electrónico"
              value={cliente.email}
              field="email"
              type="email"
              onSaved={refresh}
            />
            <EditableRow
              icon={Phone}
              label="Celular"
              value={cliente.celular || ""}
              field="celular"
              onSaved={refresh}
            />
            <EditableRow
              icon={Users}
              label="WhatsApp"
              value={cliente.celular_whatsapp || ""}
              field="celular_whatsapp"
              onSaved={refresh}
            />
            <EditableRow
              icon={Calendar}
              label="Fecha de nacimiento"
              value={String(cliente.fecha_nacimiento || "")}
              field="fecha_nacimiento"
              type="date"
              onSaved={refresh}
            />

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Dirección</p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {cliente.direccion || "No registrada"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Documento</p>
                <p className="text-sm font-semibold text-slate-800">{cliente.documento}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Nacionalidad</p>
                <p className="text-sm font-semibold text-slate-800">{cliente.nacionalidad || "-"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-2">
          {quickLinks.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-red-600 font-semibold hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">
                Esta acción es permanente. ¿Seguro que quieres eliminar tu cuenta?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sí, eliminar"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-md border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
