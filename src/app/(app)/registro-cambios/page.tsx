
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { History, User, Edit, Trash2, PlusCircle, Power, Cog } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { mockLogs } from "@/data/mock-data";
import type { LogEntry } from "./schema";

const getActionIcon = (accion: LogEntry['accion']) => {
  switch (accion) {
    case 'Creación':
      return <PlusCircle className="h-4 w-4" />;
    case 'Edición':
      return <Edit className="h-4 w-4" />;
    case 'Eliminación':
      return <Trash2 className="h-4 w-4" />;
    case 'Login':
        return <Power className="h-4 w-4" />;
    case 'Sistema':
      return <Cog className="h-4 w-4" />;
    default:
      return null;
  }
};


export default function RegistroCambiosPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [logs] = useLocalStorage<LogEntry[]>("dicipware_logs", mockLogs);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const sortedLogs = React.useMemo(() => {
    if (!isClient) return [];
    return [...logs].sort((a,b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime());
  }, [logs, isClient]);

  if (!isClient) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-6 w-6" />
            Registro de Actividad del Sistema
          </CardTitle>
          <CardDescription>
            Un registro cronológico de todos los eventos y cambios importantes realizados en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                  <TableHead className="w-[150px]">Usuario</TableHead>
                  <TableHead className="w-[120px]">Acción</TableHead>
                  <TableHead className="w-[120px]">Entidad</TableHead>
                  <TableHead>Descripción del Evento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No hay registros de actividad para mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(parseISO(log.fecha), "PPP p", { locale: es })}
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {log.usuario}
                      </TableCell>
                       <TableCell>
                        <Badge variant={
                          log.accion === 'Creación' ? 'success' : 
                          log.accion === 'Eliminación' ? 'destructive' :
                          log.accion === 'Edición' ? 'default' :
                          'secondary'
                        } className="capitalize flex items-center gap-1.5">
                          {getActionIcon(log.accion)}
                          {log.accion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="capitalize">{log.entidad}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.descripcion}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
