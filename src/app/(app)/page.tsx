
"use client";

import * as React from "react";
import { KpiCard } from "@/components/kpi-card";
import { PieChartCard } from "@/components/charts/pie-chart-card";
import type { KpiData, PieDataPoint, ToteCompanyHolder, OverdueToteInfo } from "@/data/kpi-data";
import type { ChartConfig } from "@/components/ui/chart";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, AlertTriangle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, isBefore, parseISO, startOfDay } from "date-fns";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { mockTotes, mockUsers, mockClientes } from "@/data/mock-data";
import type { Tote } from "./totes/schema";
import type { User } from "./usuarios/schema";
import type { Cliente } from "./clientes/schema";


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

// Helper function to determine if a tote is overdue, moved here for client-side calculation
const isToteOverdue = (tote: Tote): boolean => {
    if (tote.estadoActual !== "Con Cliente") return false;
    
    if (tote.fechaDespacho) {
      try {
        if (differenceInDays(new Date(), parseISO(tote.fechaDespacho)) >= 30) return true;
      } catch (e) { console.error(e) }
    }
    if (tote.fechaVencimiento) {
      try {
        if (isBefore(parseISO(tote.fechaVencimiento), startOfDay(new Date()))) return true;
      } catch (e) { console.error(e) }
    }
    return false;
};


export default function DashboardPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [totes] = useLocalStorage<Tote[]>("dicipware_totes", mockTotes);
  const [users] = useLocalStorage<User[]>("dicipware_users", mockUsers);
  const [clientes] = useLocalStorage<Cliente[]>("dicipware_clientes", mockClientes);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const kpiData = React.useMemo<KpiData | null>(() => {
    if (!isClient) return null;

    const activeUsers = users.filter(user => user.status === 'Active').length;
    const totalTotes = totes.filter(t => t.estadoActual !== 'De Baja').length;
    
    const totesByStatusMap = totes.reduce((acc, tote) => {
      if (tote.estadoActual !== 'De Baja') {
        acc[tote.estadoActual] = (acc[tote.estadoActual] || 0) + 1;
      }
      return acc;
    }, {} as Record<Tote['estadoActual'], number>);

    const totesByStatus: PieDataPoint[] = Object.entries(totesByStatusMap)
      .map(([name, value], index) => ({
        name,
        value,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      }));

    const totesConClienteMap = totes
      .filter(t => t.estadoActual === 'Con Cliente' && t.clienteId)
      .reduce((acc, tote) => {
        const cliente = clientes.find(c => c.id === tote.clienteId);
        const clientName = cliente?.nombreEmpresa || 'Cliente Desconocido';
        acc[clientName] = (acc[clientName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const totesInUseByCompany: ToteCompanyHolder[] = Object.entries(totesConClienteMap)
      .map(([companyName, toteCount]) => ({ companyName, toteCount }))
      .sort((a,b) => b.toteCount - a.toteCount);

    const overdueTotesMap = totes
      .filter(isToteOverdue)
      .reduce((acc, tote) => {
        const cliente = clientes.find(c => c.id === tote.clienteId);
        const clientName = cliente?.nombreEmpresa || 'Cliente Desconocido';
        acc[clientName] = (acc[clientName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const overdueTotes: OverdueToteInfo[] = Object.entries(overdueTotesMap)
      .map(([companyName, count]) => ({ companyName, count }))
      .sort((a,b) => b.count - a.count);

    return {
      activeUsers,
      totalTotes,
      totesByStatus,
      totesInUseByCompany,
      overdueTotes,
    };
  }, [isClient, totes, users, clientes]);

  const totesByStatusConfig = React.useMemo<ChartConfig>(() => {
    if (!kpiData?.totesByStatus) return {};
    return kpiData.totesByStatus.reduce((acc, cur) => {
      acc[cur.name] = { label: cur.name, color: cur.fill };
      return acc;
    }, {} as ChartConfig);
  }, [kpiData]);
  
  const totalTotesInOperation = React.useMemo(() => {
    if (!kpiData?.totesByStatus) return 0;
    const totesConCliente = kpiData.totesByStatus.find(d => d.name === "Con Cliente");
    return totesConCliente?.value ?? 0;
  }, [kpiData]);
  
  const totalOverdueTotesCount = React.useMemo(() => {
    if (!kpiData?.overdueTotes) return 0;
    return kpiData.overdueTotes.reduce((sum, item) => sum + item.count, 0);
  }, [kpiData]);

  if (!isClient || !kpiData) {
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

  return (
    <div className="space-y-6">
      {/* Fila 1: Estado General de Totes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Estado de Totes" className="lg:col-span-1">
          <PieChartCard data={kpiData.totesByStatus || []} chartConfig={totesByStatusConfig} />
        </KpiCard>
        
        <KpiCard title="Totes con Clientes" className="lg:col-span-1">
           <div className="flex items-center gap-4 mb-3">
             <Package className="h-10 w-10 text-primary" />
             <div>
               <p className="text-3xl font-bold">{toteCountFormatter(totalTotesInOperation)}</p>
               <p className="text-xs text-muted-foreground">Unidades actualmente con clientes</p>
             </div>
           </div>
           {kpiData.totesInUseByCompany && kpiData.totesInUseByCompany.length > 0 ? (
            <ScrollArea className="h-[120px] pr-3"> 
              <div className="space-y-2 text-sm">
                {kpiData.totesInUseByCompany.map((company, index) => (
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
           {kpiData.overdueTotes && kpiData.overdueTotes.length > 0 ? (
            <ScrollArea className="h-[120px] pr-3">
              <div className="space-y-2 text-sm">
                {kpiData.overdueTotes.map((item, index) => (
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
              <p className="text-3xl font-bold">{kpiData.totalTotes !== undefined ? toteCountFormatter(kpiData.totalTotes) : "N/A"}</p>
              <p className="text-xs text-muted-foreground">Unidades totales (sin contar bajas)</p>
            </div>
          </div>
        </KpiCard>

         <KpiCard title="Usuarios Activos" className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold">{kpiData.activeUsers !== undefined ? userCountFormatter(kpiData.activeUsers) : "N/A"}</p>
              <p className="text-xs text-muted-foreground">Usuarios con acceso al sistema</p>
            </div>
          </div>
        </KpiCard>
      </div>
    </div>
  );
}
