// services/landingService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface LandingStats {
  negocios_activos: number;
  pedidos_entregados: number;
}

// Valores de respaldo si la API no responde, para que la landing nunca
// se rompa ni muestre "0" mientras el backend esté caído.
const FALLBACK_STATS: LandingStats = {
  negocios_activos: 500,
  pedidos_entregados: 50000,
};

export async function getLandingStats(): Promise<LandingStats> {
  try {
    const res = await fetch(`${API_URL}/landing/stats`, {
      next: { revalidate: 300 }, // 5 min, es una métrica de marketing, no necesita ser al segundo
    });
    if (!res.ok) return FALLBACK_STATS;
    const data = await res.json();
    if (typeof data.negocios_activos !== "number" || typeof data.pedidos_entregados !== "number") {
      return FALLBACK_STATS;
    }
    return data;
  } catch (error) {
    console.error("Error al obtener las métricas de la landing:", error);
    return FALLBACK_STATS;
  }
}

export function formatStatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K+`;
  }
  return `${value}+`;
}
