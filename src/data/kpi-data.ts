
/**
 * @fileOverview Este archivo define las estructuras de datos (tipos) para los KPIs de la aplicación.
 * Anteriormente contenía datos de ejemplo, pero ahora sirve principalmente para la definición de tipos,
 * ya que los datos se obtendrán (o simularán) desde un servicio de backend.
 */

export interface TimeSeriesDataPoint {
  date: string; // Formato ISO, ej: "2023-01-01"
  value: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  fill: string; // color para la porción del gráfico de pastel
}

export interface ToteCompanyHolder {
  companyName: string;
  toteCount: number;
}

export interface OverdueToteInfo {
  companyName: string;
  count: number;
}

export interface KpiData {
  userSignups: TimeSeriesDataPoint[];
  totalTotes?: number;
  totesInUseByCompany?: ToteCompanyHolder[];
  totesByStatus?: PieDataPoint[];
  overdueTotes?: OverdueToteInfo[];
}

// Los datos de ejemplo (mockKpiData) y la función filterTimeSeriesData han sido removidos
// ya que la lógica de obtención y filtrado de datos ahora reside en la página
// que consume el servicio sqlserver-service.ts (o directamente en el servicio).

    