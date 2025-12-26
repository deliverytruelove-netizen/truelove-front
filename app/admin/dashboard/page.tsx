// app\admin\dashboard\page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import MainLayout from "../components/MainLayout";
import { StatCard } from "./components/stat-card";
import { ApprovalChart } from "./components/approval-chart";
import { BusinessTypesChart } from "./components/business-types-chart";
import { RecentRegistrations } from "./components/recent-registrations";
import { ActivitySummary } from "./components/activity-summary";
import { fetchDashboardStats } from "./services/dashboard.service";
import { Users, Truck, Store, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { TopClientsChart } from "./components/top-clients-chart";
import { TopStoresChart } from "./components/top-stores-chart";
// import { LocalRatingsDetail } from "./components/local-ratings-detail"

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    staleTime: 30000,
  });
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [lastLoginTime, setLastLoginTime] = useState("");

  if (error) {
    console.error("Error fetching dashboard data:", error);
  }

  // Calcular el total de aprobaciones pendientes
  const totalPendingApprovals =
    (data?.motorizados.pendientes || 0) + (data?.socios.pendientes || 0);

  // Calcular registros recientes (últimas 24 horas)
  const recentActivity =
    data?.registrosRecientes.filter((reg) => {
      try {
        const regDate = new Date(reg.fecha);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return regDate >= yesterday;
      } catch {
        return false;
      }
    }).length || 0;
  useEffect(() => {
    // Actualizar la hora solo en el cliente
    setCurrentTime(new Date().toLocaleTimeString());

    // Opcional: actualizar cada segundo
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    setLastLoginTime(new Date().toISOString());
  }, []);
  return (
    <MainLayout>
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            {/* <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Dashboard
            </h1> */}
            <p className="text-sm text-muted-foreground">
              Resumen general de la plataforma TrueLove
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              Última actualización: {currentTime}
            </span>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[120px] w-full" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Usuarios"
                value={data?.usuarios.total || 0}
                icon={<Users />}
                description="Usuarios registrados en la plataforma"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Motorizados"
                value={data?.motorizados.total || 0}
                icon={<Truck />}
                description={`${
                  data?.motorizados.pendientes || 0
                } pendientes de aprobación`}
                className="border-yellow-200 dark:border-yellow-900"
              />
              <StatCard
                title="Socios Comerciales"
                value={data?.socios.total || 0}
                icon={<Store />}
                description={`${
                  data?.socios.pendientes || 0
                } pendientes de aprobación`}
                className="border-yellow-200 dark:border-yellow-900"
              />
              <StatCard
                title="Usuarios Activos"
                value={data?.usuarios.activos || 0}
                icon={<UserCheck />}
                description={`${(
                  ((data?.usuarios.activos || 0) /
                    (data?.usuarios.total || 1)) *
                  100
                ).toFixed(0)}% del total`}
                className="border-green-200 dark:border-green-900"
              />
            </>
          )}
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[250px] w-full" />
              ))}
            </>
          ) : (
            <>
              <ApprovalChart
                title="Estado de Motorizados"
                data={{
                  pendientes: data?.motorizados.pendientes || 0,
                  aprobados: data?.motorizados.aprobados || 0,
                  rechazados: data?.motorizados.rechazados || 0,
                }}
              />
              <ApprovalChart
                title="Estado de Socios"
                data={{
                  pendientes: data?.socios.pendientes || 0,
                  aprobados: data?.socios.aprobados || 0,
                  rechazados: data?.socios.rechazados || 0,
                }}
              />
              <ActivitySummary
                pendingApprovals={totalPendingApprovals}
                recentActivity={recentActivity}
                lastLogin={lastLoginTime}
              />
            </> 
          )}
        </div>
        {/* NUEVOS GRÁFICOS DE RANKINGS */}
     {/* GRÁFICOS DE RANKINGS */}
     <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {isLoading ? (
          <>
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))}
          </>
        ) : (
          <>
            <TopClientsChart data={data?.topClients || []} />
            <TopStoresChart data={data?.topStores || []} />
          </>
        )}
      </div>
        {/* Gráfico de tipos de negocio */}
        <div className="grid gap-4 grid-cols-1">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <BusinessTypesChart data={data?.socios.porTipoNegocio || {}} />
          )}
        </div>

        {/* Registros recientes */}
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <RecentRegistrations registrations={data?.registrosRecientes || []} />
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
