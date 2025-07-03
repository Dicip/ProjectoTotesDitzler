
'use server';

import type { KpiData, TimeSeriesDataPoint, PieDataPoint, ToteCompanyHolder, OverdueToteInfo } from '@/data/kpi-data';
import { format } from 'date-fns';
import sql from 'mssql';
import { sqlConfig } from '@/lib/db-config';
import { mockKpiData } from '@/data/mock-data';

/**
 * @fileOverview Service for fetching KPI data from a SQL Server database.
 */

const statusColors: Record<string, string> = {
  'Disponible': 'hsl(var(--chart-1))',
  'En Uso': 'hsl(var(--chart-4))',
  'En Lavado': 'hsl(var(--chart-2))',
  'En Mantenimiento': 'hsl(var(--chart-3))',
  'De Baja': 'hsl(var(--muted))',
};

const checkDbConfig = () => {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return;
  }
  if (!sqlConfig.server || !sqlConfig.user || !sqlConfig.database || !sqlConfig.password) {
    throw new Error("La configuración de la base de datos está incompleta. Por favor, revise las variables de entorno en el archivo .env.local y reinicie el servidor.");
  }
}

async function executeQuery<T>(query: string, pool: sql.ConnectionPool): Promise<T[]> {
  try {
    const result = await pool.request().query(query);
    return result.recordset as T[];
  } catch (err) {
    console.error(`SQL error in executeQuery for query: ${query.substring(0,100)}...`, err);
    throw err;
  }
}

export async function getKpiDataFromSqlServer(): Promise<KpiData> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    console.log("[OFFLINE_MODE] Serving mock KPI data.");
    return Promise.resolve(mockKpiData);
  }

  checkDbConfig(); // Proactive check
  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    console.log("Successfully connected to SQL Server for KPI data.");

    const userSignupsQuery = `
      SELECT
          CAST(FechaCreacion AS DATE) AS date,
          COUNT(*) AS value
      FROM Usuarios
      GROUP BY CAST(FechaCreacion AS DATE)
      ORDER BY date;
    `;
    const userSignupsData = await executeQuery<TimeSeriesDataPoint>(userSignupsQuery, pool);

    const totalTotesQuery = `SELECT COUNT(*) AS totalTotes FROM Totes WHERE EstadoActual <> 'De Baja';`;
    const totalTotesResult = await executeQuery<{ totalTotes: number }>(totalTotesQuery, pool);
    const totalTotes = totalTotesResult[0]?.totalTotes ?? 0;

    const totesInUseQuery = `
      SELECT
          UbicacionActual AS companyName,
          COUNT(*) AS toteCount
      FROM Totes
      WHERE EstadoActual = 'En Uso' AND UbicacionActual IS NOT NULL AND UbicacionActual <> ''
      GROUP BY UbicacionActual
      ORDER BY toteCount DESC;
    `;
    const totesInUseByCompany = await executeQuery<ToteCompanyHolder>(totesInUseQuery, pool);

    const totesByStatusQuery = `
      SELECT
          EstadoActual AS name,
          COUNT(*) AS value
      FROM Totes
      WHERE EstadoActual <> 'De Baja'
      GROUP BY EstadoActual;
    `;
    const totesByStatusRaw = await executeQuery<{ name: string, value: number }>(totesByStatusQuery, pool);
    const totesByStatus: PieDataPoint[] = totesByStatusRaw.map(row => ({
      name: row.name,
      value: row.value,
      fill: statusColors[row.name] || 'hsl(var(--muted))'
    }));

    const overdueTotesQuery = `
      SELECT
          UbicacionActual AS companyName,
          COUNT(*) AS count
      FROM Totes
      WHERE EstadoActual = 'En Uso' AND FechaRetornoPrevista IS NOT NULL AND FechaRetornoPrevista < GETDATE() AND UbicacionActual IS NOT NULL AND UbicacionActual <> ''
      GROUP BY UbicacionActual
      ORDER BY count DESC;
    `;
    const overdueTotes = await executeQuery<OverdueToteInfo>(overdueTotesQuery, pool);

    return {
      userSignups: userSignupsData.map(d => ({...d, date: format(new Date(d.date), 'yyyy-MM-dd')})),
      totalTotes: totalTotes,
      totesInUseByCompany: totesInUseByCompany,
      totesByStatus: totesByStatus,
      overdueTotes: overdueTotes,
    };

  } catch (error) {
    console.error("Failed to fetch KPI data from SQL Server:", error);
    throw new Error("No se pudieron obtener los datos del dashboard desde la base de datos.");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (poolError) {
        console.error("Error closing SQL Server connection pool:", poolError);
      }
    }
  }
}

// Helper function to establish a SQL connection pool
// To be used by individual CRUD actions if needed, though they might manage their own connections
export async function getDbPool() {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
     throw new Error("Database pool not available in offline mode.");
  }
  if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_DATABASE) {
    throw new Error("Database environment variables not configured.");
  }
  return sql.connect(sqlConfig);
}
