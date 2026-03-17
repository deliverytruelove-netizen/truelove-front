// app/admin/test-notificaciones/page.tsx
"use client";

import React from "react";
import MainLayout from "../components/MainLayout";
import TestNotificationsModule from "@/components/TestNotificationsModule";

const TestNotificationsPage: React.FC = () => {
    return (
        <MainLayout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Módulo de Pruebas de Notificaciones</h1>
                <TestNotificationsModule />
            </div>
        </MainLayout>
    );
};

export default TestNotificationsPage;
