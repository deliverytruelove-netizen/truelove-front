// components/NotificationLogList.tsx
"use client";

import type React from "react";
import { useState } from "react";
import {
  Search,
  RefreshCw,
  X,
  Bell,
  Send,
  CheckCircle,
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Section from "@/components/layout/Section";
import { useQuery } from "@tanstack/react-query";
import { fetchNotificationLogs } from "@/app/admin/notificaciones/services/notification.service";
import type {
  NotificationLog,
  NotificationFilters,
} from "@/app/admin/notificaciones/types/notification.types";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const APP_NAME_LABELS: Record<string, { label: string; color: string }> = {
  cliente: { label: "Cliente", color: "bg-blue-100 text-blue-700" },
  socio: { label: "Socio", color: "bg-purple-100 text-purple-700" },
  motorizado: { label: "Motorizado", color: "bg-orange-100 text-orange-700" },
  socio_web: { label: "Socio Web", color: "bg-indigo-100 text-indigo-700" },
  prueba: { label: "Prueba", color: "bg-gray-100 text-gray-700" },
};

const ESTADO_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "enviado", label: "Enviados" },
  { value: "recibido", label: "Recibidos" },
  { value: "abierto", label: "Abiertos" },
  { value: "no_recibido", label: "No recibidos" },
];

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const getDeliveryStatus = (log: NotificationLog) => {
  if (log.opened_at)
    return {
      label: "Abierto",
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  if (log.received_at)
    return {
      label: "Recibido",
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  if (log.sent_at)
    return {
      label: "Enviado",
      icon: Send,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    };
  return {
    label: "Pendiente",
    icon: XCircle,
    color: "text-gray-400",
    bg: "bg-gray-50",
  };
};

const NotificationLogList: React.FC = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    per_page: 20,
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notification-logs", filters],
    queryFn: () => fetchNotificationLogs(filters),
  });

  const logs = response?.data ?? [];
  const pagination = response?.pagination;
  const stats = response?.stats;

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  return (
    <Section title="Logs de Notificaciones">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {stats.total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.enviados.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Enviados</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.recibidos.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Recibidos</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.abiertos.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Abiertos</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por título, contenido o user_id..."
                className="w-full pl-9 py-2 h-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setFilters((prev) => ({ ...prev, search: undefined, page: 1 }));
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Buscar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Actualizar">
              <RefreshCw size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.app_name || "all"}
              onValueChange={(value) => handleFilterChange("app_name", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todas las apps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las apps</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="socio">Socio</SelectItem>
                <SelectItem value="motorizado">Motorizado</SelectItem>
                <SelectItem value="socio_web">Socio Web</SelectItem>
                <SelectItem value="prueba">Prueba</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.estado || "all"}
              onValueChange={(value) => handleFilterChange("estado", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-auto h-10"
              value={filters.fecha_desde || ""}
              onChange={(e) => handleFilterChange("fecha_desde", e.target.value)}
              title="Desde"
            />
            <Input
              type="date"
              className="w-auto h-10"
              value={filters.fecha_hasta || ""}
              onChange={(e) => handleFilterChange("fecha_hasta", e.target.value)}
              title="Hasta"
            />
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">Título / Contenido</th>
                <th className="px-4 py-3 text-center">App</th>
                <th className="px-4 py-3 text-center">Usuario</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Enviado</th>
                <th className="px-4 py-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="bg-white border-b">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="animate-pulse flex items-center space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : logs.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      No se encontraron notificaciones
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Ajusta los filtros para ver resultados.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => {
                  const status = getDeliveryStatus(log);
                  const StatusIcon = status.icon;
                  const appInfo = log.app_name
                    ? APP_NAME_LABELS[log.app_name] || {
                        label: log.app_name,
                        color: "bg-gray-100 text-gray-700",
                      }
                    : null;
                  const rowNum =
                    ((pagination?.current_page ?? 1) - 1) * (pagination?.per_page ?? 20) +
                    index +
                    1;
                  const isExpanded = expandedRow === log.id;

                  return (
                    <tr
                      key={log.id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    >
                      <td className="px-4 py-3 text-center font-medium text-gray-600">
                        {rowNum}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-800 truncate">
                            {log.title || "Sin título"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {log.body || "Sin contenido"}
                          </div>
                          {isExpanded && log.data && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                              {JSON.stringify(log.data, null, 2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {appInfo ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${appInfo.color}`}
                          >
                            {appInfo.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {log.user_id ? (
                          <div>
                            <span className="font-medium text-gray-800">
                              #{log.user_id}
                            </span>
                            {log.user_type && (
                              <div className="text-xs text-gray-500">
                                {log.user_type}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {formatDate(log.sent_at || log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.total > 0 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            perPage={pagination.per_page}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onPerPageChange={(perPage) =>
              setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }))
            }
            itemsInCurrentPage={logs.length}
          />
        )}
      </div>
    </Section>
  );
};

export default NotificationLogList;
