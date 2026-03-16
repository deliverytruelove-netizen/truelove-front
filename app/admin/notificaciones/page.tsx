// app/admin/notificaciones/page.tsx
"use client";

import React from "react";
import MainLayout from "../components/MainLayout";
import NotificationLogList from "@/components/NotificationLogList";

const Notificaciones: React.FC = () => {
  return (
    <MainLayout>
      <NotificationLogList />
    </MainLayout>
  );
};

export default Notificaciones;
