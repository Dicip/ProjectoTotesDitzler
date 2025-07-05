
'use server';

import type { KpiData } from '@/data/kpi-data';
import { mockKpiData } from '@/data/mock-data';

/**
 * @fileOverview Service for fetching KPI data for the application.
 * This version is configured for OFFLINE DEMO ONLY and uses mock data.
 */

export async function getKpiDataFromSqlServer(): Promise<KpiData> {
  console.log("[DEMO_MODE] Serving mock KPI data.");
  return mockKpiData;
}
