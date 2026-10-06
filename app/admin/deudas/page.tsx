// app\admin\deudas\page.tsx
"use client";

import MainLayout from "../components/MainLayout";
import DeudasList from "./components/DeudasList";

export default function DeudasPage() {
  return (
    <MainLayout>
      <DeudasList />
    </MainLayout>
  );
}
