
'use server';

import { getKpiDataFromSqlServer } from '@/lib/sqlserver-service';
import type { KpiData } from '@/data/kpi-data';

/**
 * Server Action to fetch all necessary KPI data for the dashboard.
 * @returns A Promise resolving to KpiData.
 */
export async function fetchDashboardData(): Promise<KpiData> {
  // In a real scenario, you might pass parameters like date ranges
  // from the client to this Server Action, and then to getKpiDataFromSqlServer.
  // For example: export async function fetchDashboardData(dateRange: { from: Date, to: Date }): Promise<KpiData>
  try {
    const data = await getKpiDataFromSqlServer();
    return data;
  } catch (error) {
    console.error("Error in fetchDashboardData Server Action:", error);
    // Re-throw the error or handle it as per your application's error handling strategy
    // This allows the client-side to catch and display an error message.
    throw new Error("Failed to fetch dashboard data from server action.");
  }
}
