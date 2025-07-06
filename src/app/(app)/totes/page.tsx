
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, MoreHorizontal, Info, CalendarIcon as CalendarLucideIcon, AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";
import { format, parseISO, isValid, isBefore, startOfDay, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import type { Cliente } from "../clientes/schema";
import { fetchClientes } from "../clientes/actions";

import type { Tote, ToteFormData } from "./schema"; 
import { toteFormSchema, TOTE_ESTADOS, TOTE_UBICACIONES } from "./schema"; 
import { fetchTotes, updateTote, deleteTote } from "./actions";


export default function TotesPage() {
  const [totes, setTotes] = React.useState<Tote[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditToteDialogOpen, setIsEditToteDialogOpen] = React.useState(false);
  const [editingTote, setEditingTote] = React.useState<Tote | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingToteId, setDeletingToteId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const form = useForm<ToteFormData>({
    resolver: zodResolver(toteFormSchema),
  });

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedTotes, fetchedClientes] = await Promise.all([
        fetchTotes(),
        fetchClientes()
      ]);
      setTotes(fetchedTotes);
      setClientes(fetchedClientes);
    } catch (e: any) {
      const errorMessage = e.message || "No se pudieron cargar los datos.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (editingTote && isEditToteDialogOpen) {
      form.reset({
        ...editingTote,
        fechaAdquisicion: parseISO(editingTote.fechaAdquisicion),
        fechaEnvasado: editingTote.fechaEnvasado ? format(parseISO(editingTote.fechaEnvasado), "yyyy-MM-dd") : null,
        fechaVencimiento: editingTote.fechaVencimiento ? format(parseISO(editingTote.fechaVencimiento), "yyyy-MM-dd") : null,
        notas: editingTote.notas || "",
        clienteId: editingTote.clienteId || null,
        lote: editingTote.lote || "",
        producto: editingTote.producto || "",
      });
    } else if (!isEditToteDialogOpen) {
      form.reset(); 
      setEditingTote(null);
    }
  }, [editingTote, form, isEditToteDialogOpen]);

  const handleOpenEditToteDialog = (tote: Tote) => {
    setEditingTote(tote);
    setIsEditToteDialogOpen(true);
  };

  const handleOpenDeleteDialog = (toteId: string) => {
    setDeletingToteId(toteId);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: ToteFormData) => {
    if (!editingTote) return; 

    try {
      const result = await updateTote(editingTote.id, data);
      if (result.success && result.tote) {
        setTotes(totes.map((t) => (t.id === result.tote!.id ? result.tote! : t)));
        toast({ title: "Tote actualizado", description: `El tote ${result.tote.codigoIdentificacion} ha sido actualizado.` });
        setIsEditToteDialogOpen(false);
        setEditingTote(null);
      } else {
        throw new Error(result.error || "No se pudo actualizar el tote.");
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error de Actualización", description: e.message });
    }
  };

  const handleDeleteTote = async () => {
    if (deletingToteId) {
      const toteToDelete = totes.find(t => t.id === deletingToteId);
      try {
        const result = await deleteTote(deletingToteId);
        if (result.success) {
          setTotes(totes.filter((t) => t.id !== deletingToteId));
          toast({ title: "Tote eliminado", description: `El tote ${toteToDelete?.codigoIdentificacion || ''} ha sido eliminado.`});
        } else {
          throw new Error(result.error || "No se pudo eliminar el tote.");
        }
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error de Eliminación", description: e.message });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingToteId(null);
      }
    }
  };
  
  const clientesMap = React.useMemo(() => 
    clientes.reduce((acc, cliente) => {
      acc[cliente.id] = cliente.nombreEmpresa;
      return acc;
    }, {} as Record<string, string>), 
  [clientes]);
  
  const filteredTotes = React.useMemo(() => {
    return totes
      .filter((tote) =>
        tote.codigoIdentificacion.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.fechaAdquisicion).getTime() - new Date(a.fechaAdquisicion).getTime());
  }, [totes, searchTerm]);

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

  if (isLoading) {
     return (
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-8 w-1/2" /> <Skeleton className="h-10 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center">
              <Image src="/img/logo.jpg" alt="Ditzler Chile Logo" width={24} height={24} className="mr-2" data-ai-hint="logo icon" />
              Control de Totes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualice y edite los totes registrados en el sistema.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Recargar</span>
            </Button>
            <Link href="/totes/informacion" legacyBehavior passHref>
              <Button variant="outline">
                <Info className="mr-2 h-4 w-4" /> Ver Información General
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {error && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al Cargar Datos</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="mb-4">
             <Input
                placeholder="Buscar por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
          </div>
          <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>F. Envasado</TableHead>
                <TableHead>F. Vencimiento</TableHead>
                <TableHead>F. Despacho</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {!isLoading && filteredTotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    {searchTerm ? "No se encontraron totes con ese código." : "No hay totes registrados."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTotes.map((tote) => (
                  <TableRow key={tote.id} className={cn(isToteOverdue(tote) && "bg-destructive/10 hover:bg-destructive/20")}>
                    <TableCell className="font-medium">{tote.codigoIdentificacion}</TableCell>
                    <TableCell>
                      <Badge variant={tote.estadoActual === "Disponible" ? "default" : (tote.estadoActual === "Con Cliente" ? "secondary" : "outline")}>
                        {tote.estadoActual}
                      </Badge>
                    </TableCell>
                    <TableCell>{tote.ubicacion}</TableCell>
                    <TableCell>{tote.clienteId ? clientesMap[tote.clienteId] || "N/A" : "-"}</TableCell>
                    <TableCell>{tote.producto || "-"}</TableCell>
                    <TableCell>{tote.lote || "-"}</TableCell>
                    <TableCell>{tote.fechaEnvasado ? format(parseISO(tote.fechaEnvasado), "P", { locale: es }) : "-"}</TableCell>
                    <TableCell className={cn(tote.fechaVencimiento && isBefore(parseISO(tote.fechaVencimiento), startOfDay(new Date())) && "text-destructive font-semibold")}>
                      {tote.fechaVencimiento ? format(parseISO(tote.fechaVencimiento), "P", { locale: es }) : "-"}
                    </TableCell>
                    <TableCell className={cn(isToteOverdue(tote) && "text-destructive font-semibold")}>
                      {tote.fechaDespacho ? format(parseISO(tote.fechaDespacho), "P", { locale: es }) : "-"}
                      {isToteOverdue(tote) && <AlertTriangle className="inline-block ml-1 h-4 w-4 text-destructive" />}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditToteDialog(tote)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(tote.id)} className={cn("text-destructive focus:text-destructive focus:bg-destructive/10", isToteOverdue(tote) && "focus:bg-destructive/20")}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditToteDialogOpen} onOpenChange={setIsEditToteDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tote</DialogTitle>
            <DialogDescription>
              Modifique los detalles del tote. La fecha de despacho se actualiza automáticamente al cambiar el estado a "Con Cliente".
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="codigoIdentificacion" render={({ field }) => ( <FormItem><FormLabel>Código</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="tipoMaterial" render={({ field }) => ( <FormItem><FormLabel>Material</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Plástico HDPE">Plástico HDPE</SelectItem><SelectItem value="Acero Inoxidable">Acero Inoxidable</SelectItem><SelectItem value="Otro">Otro</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="capacidad" render={({ field }) => ( <FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="unidadCapacidad" render={({ field }) => ( <FormItem><FormLabel>Unidad</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Litros">Litros</SelectItem><SelectItem value="Kg">Kg</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="estadoActual" render={({ field }) => ( <FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{TOTE_ESTADOS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="ubicacion" render={({ field }) => ( <FormItem><FormLabel>Ubicación</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{TOTE_UBICACIONES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente Asignado</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                      value={field.value ?? "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ninguno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Ninguno</SelectItem>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nombreEmpresa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="producto" render={({ field }) => ( <FormItem><FormLabel>Producto</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="lote" render={({ field }) => ( <FormItem><FormLabel>Lote</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
              
              <FormField control={form.control} name="fechaEnvasado" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Envasado</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(parseISO(field.value), "PPP", { locale: es }) : <span>Seleccione fecha</span>}<CalendarLucideIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} initialFocus locale={es}/></PopoverContent></Popover><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="fechaVencimiento" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Vencimiento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(parseISO(field.value), "PPP", { locale: es }) : <span>Seleccione fecha</span>}<CalendarLucideIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} initialFocus locale={es}/></PopoverContent></Popover><FormMessage /></FormItem> )} />
              
              <FormField control={form.control} name="notas" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
              
              <DialogFooter className="md:col-span-2">
                 <DialogClose asChild>
                   <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el tote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingToteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTote} className={cn(buttonVariants({ variant: "destructive" }))} disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
