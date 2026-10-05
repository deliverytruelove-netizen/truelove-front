// app\admin\entrega-notas\page.tsx
"use client";

import MainLayout from "../components/MainLayout";
import EntregaNotasList from "./components/EntregaNotasList";

export default function EntregaNotasPage() {
  return (
    <MainLayout>
      <EntregaNotasList />
    </MainLayout>
  );
}
