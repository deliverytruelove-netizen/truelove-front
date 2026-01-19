// app/admin/clientes/page.tsx
"use client";

import React from "react";
import MainLayout from "../components/MainLayout";
import ClienteList from "@/components/ClienteList";

const Clientes: React.FC = () => {
  return (
    <MainLayout>
      <ClienteList />
    </MainLayout>
  );
};

export default Clientes;
