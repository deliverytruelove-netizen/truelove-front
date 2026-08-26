"use client";

import { useState } from "react";
import MainLayout from "../components/MainLayout";
import PedidosTable from "./components/PedidosTable";
import SolicitudesCancelacionList from "./components/SolicitudesCancelacionList";

export default function PedidosPage() {
  const [tab, setTab] = useState<"pedidos" | "solicitudes">("pedidos");

  return (
    <MainLayout>
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setTab("pedidos")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
              tab === "pedidos"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setTab("solicitudes")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
              tab === "solicitudes"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Solicitudes de cancelación
          </button>
        </nav>
      </div>

      {tab === "pedidos" ? <PedidosTable /> : <SolicitudesCancelacionList />}
    </MainLayout>
  );
}
