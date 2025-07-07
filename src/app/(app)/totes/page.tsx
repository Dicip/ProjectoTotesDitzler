
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, MoreHorizontal, Info, CalendarIcon as CalendarLucideIcon, AlertTriangle, X, ScanLine, PlusCircle } from "lucide-react";
import { format, parseISO, isBefore, startOfDay, differenceInDays } from "date-fns";
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
import { Skeleton } from "@/components/ui/skeleton";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { mockTotes, mockClientes, mockUsers } from "@/data/mock-data";

import type { Cliente } from "../clientes/schema";
import type { User } from "../usuarios/schema";
import type { Tote, ToteFormData } from "./schema"; 
import { toteFormSchema, TOTE_ESTADOS, TOTE_UBICACIONES } from "./schema"; 


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

export default function TotesPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [totes, setTotes] = useLocalStorage<Tote[]>("dicipware_totes", mockTotes);
  const [clientes] = useLocalStorage<Cliente[]>("dicipware_clientes", mockClientes);
  const [users] = useLocalStorage<User[]>("dicipware_users", mockUsers);
  const [isEditToteDialogOpen, setIsEditToteDialogOpen] = React.useState(false);
  const [editingTote, setEditingTote] = React.useState<Tote | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingToteId, setDeletingToteId] = React.useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [locationFilter, setLocationFilter] = React.useState("all");
  const [clientFilter, setClientFilter] = React.useState("all");
  const [operatorFilter, setOperatorFilter] = React.useState("all");
  
  const [isScanDialogOpen, setIsScanDialogOpen] = React.useState(false);
  const [scanCode, setScanCode] = React.useState("");

  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ToteFormData>({
    resolver: zodResolver(toteFormSchema),
    defaultValues: {
      codigoIdentificacion: "",
      tipoMaterial: "Plástico HDPE",
      capacidad: 1000,
      unidadCapacidad: "Litros",
      estadoActual: "Disponible",
      ubicacion: "Patio de recepción",
      producto: "",
      clienteId: null,
      operadorId: null,
      lote: "",
      fechaEnvasado: null,
      fechaVencimiento: null,
      notas: "",
    },
  });

  React.useEffect(() => {
    if (!isEditToteDialogOpen) {
      setEditingTote(null);
      form.reset({
        codigoIdentificacion: "",
        tipoMaterial: "Plástico HDPE",
        capacidad: 1000,
        unidadCapacidad: "Litros",
        estadoActual: "Disponible",
        ubicacion: "Patio de recepción",
        producto: "",
        clienteId: null,
        operadorId: null,
        lote: "",
        fechaEnvasado: null,
        fechaVencimiento: null,
        notas: "",
      });
    } else if (editingTote) {
       form.reset({
        ...editingTote,
        fechaEnvasado: editingTote.fechaEnvasado ? format(parseISO(editingTote.fechaEnvasado), "yyyy-MM-dd") : null,
        fechaVencimiento: editingTote.fechaVencimiento ? format(parseISO(editingTote.fechaVencimiento), "yyyy-MM-dd") : null,
        notas: editingTote.notas || "",
        clienteId: editingTote.clienteId || null,
        operadorId: editingTote.operadorId || null,
        lote: editingTote.lote || "",
        producto: editingTote.producto || "",
      });
    }
  }, [editingTote, isEditToteDialogOpen, form]);
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
    setClientFilter("all");
    setOperatorFilter("all");
  };

  const handleOpenAddToteDialog = () => {
    setEditingTote(null);
    setIsEditToteDialogOpen(true);
  };

  const handleOpenEditToteDialog = (tote: Tote) => {
    setEditingTote(tote);
    setIsEditToteDialogOpen(true);
  };

  const handleOpenDeleteDialog = (toteId: string) => {
    setDeletingToteId(toteId);
    setIsDeleteDialogOpen(true);
  };

  const handleScan = (code: string) => {
    if (!code) {
      toast({ variant: "destructive", title: "Error", description: "Por favor ingrese un código para escanear." });
      return;
    }
    const found = totes.find(t => t.codigoIdentificacion.toLowerCase() === code.toLowerCase());
    
    setIsScanDialogOpen(false);
    setScanCode("");

    if (found) {
      toast({ title: "Tote Encontrado", description: `Mostrando detalles para ${found.codigoIdentificacion}.` });
      handleOpenEditToteDialog(found);
    } else {
      toast({ title: "Tote No Encontrado", description: "Puede registrar los detalles para el nuevo tote." });
      form.reset({ // Pre-fill the form for a new tote
        codigoIdentificacion: code,
        tipoMaterial: "Plástico HDPE",
        capacidad: 1000,
        unidadCapacidad: 'Litros',
        estadoActual: "Disponible",
        ubicacion: "Patio de recepción",
        producto: "",
        clienteId: null,
        operadorId: null,
        lote: "",
        fechaEnvasado: null,
        fechaVencimiento: null,
        notas: "",
      });
      setEditingTote(null); // Set to add mode
      setIsEditToteDialogOpen(true);
    }
  };


  const onSubmit = async (data: ToteFormData) => {
    try {
        if (editingTote) { // Update logic
            let fechaDespacho = editingTote.fechaDespacho;
            if (data.estadoActual === 'Con Cliente' && editingTote.estadoActual !== 'Con Cliente') {
                fechaDespacho = startOfDay(new Date()).toISOString();
            } else if (data.estadoActual !== 'Con Cliente') {
                fechaDespacho = null;
            }

            const envasadoDate = data.fechaEnvasado ? new Date(data.fechaEnvasado) : null;
            const vencimientoDate = data.fechaVencimiento ? new Date(data.fechaVencimiento) : null;

            const updatedTote: Tote = {
                ...editingTote,
                ...data,
                fechaEnvasado: envasadoDate && !isNaN(envasadoDate.getTime()) ? envasadoDate.toISOString() : null,
                fechaVencimiento: vencimientoDate && !isNaN(vencimientoDate.getTime()) ? vencimientoDate.toISOString() : null,
                fechaDespacho: fechaDespacho,
            };
            
            setTotes(totes.map((t) => (t.id === updatedTote.id ? updatedTote : t)));
            toast({ title: "Tote actualizado", description: `El tote ${updatedTote.codigoIdentificacion} ha sido actualizado.` });
        } else { // Add logic
            const codeExists = totes.some(t => t.codigoIdentificacion.toLowerCase() === data.codigoIdentificacion.toLowerCase());
            if (codeExists) {
                throw new Error("Ya existe un tote con este código de identificación.");
            }
            const envasadoDate = data.fechaEnvasado ? new Date(data.fechaEnvasado) : null;
            const vencimientoDate = data.fechaVencimiento ? new Date(data.fechaVencimiento) : null;

            const newTote: Tote = {
                id: `tote_${new Date().getTime()}`,
                fechaAdquisicion: new Date().toISOString(),
                ...data,
                producto: data.producto || undefined,
                clienteId: data.clienteId || null,
                operadorId: data.operadorId || null,
                lote: data.lote || undefined,
                fechaEnvasado: envasadoDate && !isNaN(envasadoDate.getTime()) ? envasadoDate.toISOString() : null,
                fechaVencimiento: vencimientoDate && !isNaN(vencimientoDate.getTime()) ? vencimientoDate.toISOString() : null,
                fechaDespacho: data.estadoActual === 'Con Cliente' ? startOfDay(new Date()).toISOString() : null,
                notas: data.notas || undefined,
            };
            setTotes([newTote, ...totes]);
            toast({ title: "Tote Registrado", description: `El tote ${newTote.codigoIdentificacion} ha sido agregado.` });
        }

        setIsEditToteDialogOpen(false);
        setEditingTote(null);

    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteTote = async () => {
    if (deletingToteId) {
      const toteToDelete = totes.find(t => t.id === deletingToteId);
      try {
        setTotes(totes.filter((t) => t.id !== deletingToteId));
        toast({ title: "Tote eliminado", description: `El tote ${toteToDelete?.codigoIdentificacion || ''} ha sido eliminado.`});
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error de Eliminación", description: "No se pudo eliminar el tote." });
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

  const usersMap = React.useMemo(() => 
    users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {} as Record<string, string>), 
  [users]);
  
  const filteredTotes = React.useMemo(() => {
    return totes
      .filter((tote) => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const inCode = tote.codigoIdentificacion.toLowerCase().includes(term);
        const inProduct = (tote.producto || "").toLowerCase().includes(term);
        const inLote = (tote.lote || "").toLowerCase().includes(term);
        return inCode || inProduct || inLote;
      })
      .filter((tote) => statusFilter === "all" || tote.estadoActual === statusFilter)
      .filter((tote) => locationFilter === "all" || tote.ubicacion === locationFilter)
      .filter((tote) => {
        if (clientFilter === "all") return true;
        if (clientFilter === "none") return !tote.clienteId;
        return tote.clienteId === clientFilter;
      })
      .filter((tote) => {
        if (operatorFilter === "all") return true;
        if (operatorFilter === "none") return !tote.operadorId;
        return tote.operadorId === operatorFilter;
      })
      .sort((a, b) => new Date(b.fechaAdquisicion).getTime() - new Date(a.fechaAdquisicion).getTime());
  }, [totes, searchTerm, statusFilter, locationFilter, clientFilter, operatorFilter]);


  if (!isClient) {
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
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center">
              <Image src="/img/logo.jpg" alt="Ditzler Chile Logo" width={24} height={24} className="mr-2" data-ai-hint="logo icon" />
              Control de Totes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualice, edite y registre los totes en el sistema.
            </p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <Button variant="outline" onClick={() => setIsScanDialogOpen(true)} className="w-full">
                <ScanLine className="mr-2 h-4 w-4" /> Escanear Tote
            </Button>
             <Button onClick={handleOpenAddToteDialog} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Registrar Tote
            </Button>
            <Link href="/totes/informacion" legacyBehavior passHref>
              <Button variant="outline" className="hidden lg:flex">
                <Info className="mr-2 h-4 w-4" /> Ver Información General
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-6 flex-wrap">
             <Input
                placeholder="Buscar por código, producto, lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow min-w-[200px]"
              />
              <div className="flex w-full md:w-auto items-center gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-auto md:w-[160px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados</SelectItem>
                        {TOTE_ESTADOS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full sm:w-auto md:w-[160px]">
                        <SelectValue placeholder="Ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las Ubicaciones</SelectItem>
                        {TOTE_UBICACIONES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-full sm:w-auto md:w-[160px]">
                        <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Clientes</SelectItem>
                        <SelectItem value="none">Sin Asignar</SelectItem>
                        {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombreEmpresa}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={operatorFilter} onValueChange={setOperatorFilter}>
                    <SelectTrigger className="w-full sm:w-auto md:w-[160px]">
                        <SelectValue placeholder="Operador" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Operadores</SelectItem>
                        <SelectItem value="none">Sin Asignar</SelectItem>
                        {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="ghost" onClick={handleClearFilters} className="px-3">
                    <X className="h-4 w-4 " />
                    <span className="hidden md:inline ml-2">Limpiar</span>
                </Button>
              </div>
          </div>
          <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>F. Envasado</TableHead>
                <TableHead>F. Vencimiento</TableHead>
                <TableHead>F. Despacho</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {filteredTotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    No se encontraron totes con los filtros actuales.
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
                    <TableCell>{tote.operadorId ? usersMap[tote.operadorId] || "N/A" : "-"}</TableCell>
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
      
      <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear Tote</DialogTitle>
            <DialogDescription>
              Ingrese el código de identificación del tote para buscarlo o registrarlo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Input
              id="scanCode"
              placeholder="Ej: TOTE-PL-001"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan(scanCode)}
            />
            <Button type="submit" onClick={() => handleScan(scanCode)}>Buscar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditToteDialogOpen} onOpenChange={setIsEditToteDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTote ? "Editar Tote" : "Registrar Nuevo Tote"}</DialogTitle>
            <DialogDescription>
             {editingTote 
                ? "Modifique los detalles del tote. La fecha de despacho se actualiza automáticamente."
                : "Complete los detalles para registrar un nuevo tote en el sistema."
             }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="codigoIdentificacion" render={({ field }) => ( <FormItem><FormLabel>Código</FormLabel><FormControl><Input {...field} disabled={!!editingTote} /></FormControl><FormMessage /></FormItem> )} />
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
               <FormField
                control={form.control}
                name="operadorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operador a Cargo</FormLabel>
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
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="producto" render={({ field }) => ( <FormItem><FormLabel>Producto</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="Ej: Pulpa de Frutilla" /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="lote" render={({ field }) => ( <FormItem><FormLabel>Lote</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="Ej: L-202405A" /></FormControl><FormMessage /></FormItem> )} />
              
              <FormField control={form.control} name="fechaEnvasado" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Envasado</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(parseISO(field.value), "PPP", { locale: es }) : <span>Seleccione fecha</span>}<CalendarLucideIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} initialFocus locale={es}/></PopoverContent></Popover><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="fechaVencimiento" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Vencimiento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(parseISO(field.value), "PPP", { locale: es }) : <span>Seleccione fecha</span>}<CalendarLucideIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} initialFocus locale={es}/></PopoverContent></Popover><FormMessage /></FormItem> )} />
              
              <FormField control={form.control} name="notas" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} value={field.value || ''} placeholder="Anotaciones adicionales sobre el tote..."/></FormControl><FormMessage /></FormItem> )} />
              
              <DialogFooter className="md:col-span-2">
                 <DialogClose asChild>
                   <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : (editingTote ? "Guardar Cambios" : "Registrar Tote")}
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
