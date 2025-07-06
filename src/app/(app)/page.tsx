
"use client";

import * as React from "react";
import { KpiCard } from "@/components/kpi-card";
import { PieChartCard } from "@/components/charts/pie-chart-card";
import { fetchDashboardData } from './actions';
import type { KpiData, PieDataPoint, ToteCompanyHolder, OverdueToteInfo } from "@/data/kpi-data";
import type { ChartConfig } from "@/components/ui/chart";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Package, AlertTriangle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const userCountFormatter = (value: number) => value.toLocaleString('es-ES');
const toteCountFormatter = (value: number) => value.toLocaleString('es-ES');

const shortenCompanyName = (name: string): string => {
  const mappings: Record<string, string> = {
    "Jugos Frescos del Valle": "Del Valle",
    "Frutas del Maipo Ltda.": "Del Maipo",
    "Exportadora Sol Radiante S.A.": "Sol Radiante",
    "Agroindustrial Los Andes": "Los Andes",
    "Planta Principal (Interno)": "Planta Principal",
  };
  if (mappings[name]) {
    return mappings[name];
  }

  let shortName = name.replace(/ S\.A\.$/i, '').replace(/ Ltda\.$/i, '').replace(/ S\.p\.A\.$/i, '').trim();
  const words = shortName.split(' ');
  if (words.length > 2) {
    if (["exportadora", "distribuidora", "agroindustrial", "comercializadora", "sociedad"].includes(words[0].toLowerCase())) {
        return words.slice(1, 3).join(' '); // Take next two words if first is common prefix
    }
    return words.slice(-2).join(' '); // Take last two words
  }
  return shortName;
};


export default function DashboardPage() {
  const [kpiDashboardData, setKpiDashboardData] = React.useState<KpiData | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [dataError, setDataError] = React.useState<string | null>(null);

  const [activeUsers, setActiveUsers] = React.useState<number | null>(null);
  const [totalTotes, setTotalTotes] = React.useState<number | null>(null);
  const [totesInUseByCompany, setTotesInUseByCompany] = React.useState<ToteCompanyHolder[] | null>(null);
  const [totesByStatusData, setTotesByStatusData] = React.useState<PieDataPoint[]>([]);
  const [overdueTotes, setOverdueTotes] = React.useState<OverdueToteInfo[] | null>(null);

  // Chart Configurations
  const [totesByStatusConfig, setTotesByStatusConfig] = React.useState<ChartConfig>({});


  React.useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const data = await fetchDashboardData();
        setKpiDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setDataError(error instanceof Error ? error.message : "No se pudieron cargar los datos del dashboard.");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (!kpiDashboardData) return;

    const { activeUsers: newActiveUsers, totalTotes: newTotalTotes, totesInUseByCompany: newTotesInUseByCompany, totesByStatus, overdueTotes: newOverdueTotes } = kpiDashboardData;

    setActiveUsers(newActiveUsers ?? null);
    setTotalTotes(newTotalTotes ?? null);
    setTotesInUseByCompany(newTotesInUseByCompany || null);
    setTotesByStatusData(totesByStatus || []);
    setOverdueTotes(newOverdueTotes || null);

    if (totesByStatus) {
      setTotesByStatusConfig(totesByStatus.reduce((acc, cur) => {
        acc[cur.name] = { label: cur.name, color: cur.fill };
        return acc;
      }, {} as ChartConfig));
    }

  }, [kpiDashboardData]);

  const totalTotesInOperation = React.useMemo(() => {
    if (!totesByStatusData) return 0;
    const totesConCliente = totesByStatusData.find(d => d.name === "Con Cliente");
    return totesConCliente?.value ?? 0;
  }, [totesByStatusData]);
  
  const totalOverdueTotesCount = React.useMemo(() => {
    if (!overdueTotes) return 0;
    return overdueTotes.reduce((sum, item) => sum + item.count, 0);
  }, [overdueTotes]);

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        {/* Fila 1 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[220px] w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full mt-2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full mt-2" /></CardContent></Card>
        </div>
        
        {/* Fila 2 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Datos</AlertTitle>
        <AlertDescription>{dataError} Por favor, revise la conexión con el servidor o inténtelo más tarde.</AlertDescription>
      </Alert>
    );
  }

  if (!kpiDashboardData) {
     return (
      <Alert variant="default" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sin Datos</AlertTitle>
        <AlertDescription>No hay datos disponibles para mostrar en el dashboard en este momento.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fila 1: Estado General de Totes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Estado de Totes" className="lg:col-span-1">
          <PieChartCard data={totesByStatusData} chartConfig={totesByStatusConfig} />
        </KpiCard>
        
        <KpiCard title="Totes con Clientes" className="lg:col-span-1">
           <div className="flex items-center gap-4 mb-3">
             <Package className="h-10 w-10 text-primary" />
             <div>
               <p className="text-3xl font-bold">{toteCountFormatter(totalTotesInOperation)}</p>
               <p className="text-xs text-muted-foreground">Unidades actualmente con clientes</p>
             </div>
           </div>
           {totesInUseByCompany && totesInUseByCompany.length > 0 ? (
            <ScrollArea className="h-[120px] pr-3"> 
              <div className="space-y-2 text-sm">
                {totesInUseByCompany.map((company, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="truncate flex-1 mr-2" title={company.companyName}>{shortenCompanyName(company.companyName)}</span>
                    <span className="font-medium text-muted-foreground">{company.toteCount} totes</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
           ) : (
             <p className="text-sm text-muted-foreground mt-2">No hay información de totes por empresa.</p>
           )}
        </KpiCard>
        
        <KpiCard title="Totes Fuera de Plazo" className="lg:col-span-1">
          <div className="flex items-center gap-4 mb-3">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <p className="text-3xl font-bold">{toteCountFormatter(totalOverdueTotesCount)}</p>
              <p className="text-xs text-muted-foreground">Unidades vencidas o con despacho > 30 días</p>
            </div>
          </div>
           {overdueTotes && overdueTotes.length > 0 ? (
            <ScrollArea className="h-[120px] pr-3">
              <div className="space-y-2 text-sm">
                {overdueTotes.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="truncate flex-1 mr-2" title={item.companyName}>{shortenCompanyName(item.companyName)}</span>
                    <span className="font-medium text-destructive">{item.count} {item.count === 1 ? 'tote' : 'totes'}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
           ) : (
             <p className="text-sm text-muted-foreground mt-2">No hay totes fuera de plazo.</p>
           )}
        </KpiCard>
      </div>
      
      {/* Fila 2: Totales y Resumen */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total de Totes en Sistema" className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <Package className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold">{totalTotes !== null ? toteCountFormatter(totalTotes) : "N/A"}</p>
              <p className="text-xs text-muted-foreground">Unidades totales (sin contar bajas)</p>
            </div>
          </div>
        </KpiCard>

         <KpiCard title="Usuarios Activos" className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold">{activeUsers !== null ? userCountFormatter(activeUsers) : "N/A"}</p>
              <p className="text-xs text-muted-foreground">Usuarios con acceso al sistema</p>
            </div>
          </div>
        </KpiCard>
      </div>
    </div>
  );
}
