
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, MoreHorizontal, Info, CalendarIcon as CalendarLucideIcon, AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";
import { format, parseISO, isValid, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import type { Tote, ToteFormData } from "./schema"; 
import { toteFormSchema } from "./schema"; 
import { fetchTotes, updateTote, deleteTote } from "./actions";


const estadoToteTranslations: Record<Tote["estadoActual"], string> = {
  Disponible: "Disponible",
  "En Uso": "En Uso",
  "En Lavado": "En Lavado",
  "En Mantenimiento": "En Mantenimiento",
  "De Baja": "De Baja",
};

const tipoMaterialTranslations: Record<Tote["tipoMaterial"], string> = {
  "Plástico HDPE": "Plástico HDPE",
  "Acero Inoxidable": "Acero Inoxidable",
  "Otro": "Otro",
};


export default function TotesPage() {
  const [totes, setTotes] = React.useState<Tote[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditToteDialogOpen, setIsEditToteDialogOpen] = React.useState(false);
  const [editingTote, setEditingTote] = React.useState<Tote | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingToteId, setDeletingToteId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ToteFormData>({
    resolver: zodResolver(toteFormSchema),
    // Default values are set when opening the dialog for editing
  });

  const loadTotes = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTotes = await fetchTotes();
      setTotes(fetchedTotes);
    } catch (e: any) {
      setError(e.message || "No se pudieron cargar los totes.");
      toast({ variant: "destructive", title: "Error", description: e.message || "No se pudieron cargar los totes." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadTotes();
  }, [loadTotes]);


  React.useEffect(() => {
    if (editingTote && isEditToteDialogOpen) {
      form.reset({
        ...editingTote,
        // The form now expects a Date object for fechaAdquisicion
        fechaAdquisicion: parseISO(editingTote.fechaAdquisicion),
        // And a string for fechaRetornoPrevista, but let's format it for the input
        fechaRetornoPrevista: editingTote.fechaRetornoPrevista ? format(parseISO(editingTote.fechaRetornoPrevista), "yyyy-MM-dd") : null,
        notas: editingTote.notas || "",
      });
    } else if (!isEditToteDialogOpen) {
      form.reset(); // Reset to defaults when dialog closes
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

    // The data object from the form should already match ToteFormData structure.
    // The `fechaAdquisicion` is a Date object, which is what the schema now expects.
    // We don't need to transform it again.
    const submissionData: ToteFormData = {
      ...data,
      notas: data.notas || null, // Ensure empty string becomes null if DB expects null
    };
    
    form.formState.isSubmitting; 

    try {
      const result = await updateTote(editingTote.id, submissionData);
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
      form.formState.isSubmitting;
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
  
  const sortedTotes = React.useMemo(() => {
    return [...totes].sort((a, b) => new Date(b.fechaAdquisicion).getTime() - new Date(a.fechaAdquisicion).getTime());
  }, [totes]);

  const isToteOverdue = (tote: Tote): boolean => {
    if (tote.estadoActual === "En Uso" && tote.fechaRetornoPrevista) {
      try {
        return isBefore(parseISO(tote.fechaRetornoPrevista), startOfDay(new Date()));
      } catch {
        return false; // Invalid date string
      }
    }
    return false;
  };

  if (isLoading && totes.length === 0) {
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
            <Button variant="outline" size="icon" onClick={loadTotes} disabled={isLoading}>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Retorno Previsto</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {isLoading && totes.length === 0 ? (
                 <TableRow><TableCell colSpan={9} className="h-24 text-center">Cargando totes...</TableCell></TableRow>
              ) : !isLoading && totes.length === 0 && !error ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No hay totes registrados en el sistema.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTotes.map((tote) => (
                  <TableRow key={tote.id} className={cn(isToteOverdue(tote) && "bg-destructive/10 hover:bg-destructive/20")}>
                    <TableCell className="font-medium">{tote.codigoIdentificacion}</TableCell>
                    <TableCell>{tipoMaterialTranslations[tote.tipoMaterial]}</TableCell>
                    <TableCell>{`${tote.capacidad} ${tote.unidadCapacidad}`}</TableCell>
                    <TableCell>
                      <Badge variant={tote.estadoActual === "Disponible" ? "default" : (tote.estadoActual === "En Uso" ? "secondary" : "outline")}>
                        {estadoToteTranslations[tote.estadoActual]}
                      </Badge>
                    </TableCell>
                    <TableCell>{tote.ubicacion}</TableCell>
                    <TableCell>{format(parseISO(tote.fechaAdquisicion), "P p", { locale: es })}</TableCell>
                    <TableCell className={cn(isToteOverdue(tote) && "text-destructive font-semibold")}>
                      {tote.fechaRetornoPrevista ? format(parseISO(tote.fechaRetornoPrevista), "P", { locale: es }) : "-"}
                      {isToteOverdue(tote) && <AlertTriangle className="inline-block ml-1 h-4 w-4 text-destructive" />}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={tote.notas || undefined}>{tote.notas || "-"}</TableCell>
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
        </CardContent>
      </Card>

      <Dialog open={isEditToteDialogOpen} onOpenChange={setIsEditToteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Tote</DialogTitle>
            <DialogDescription>
              Modifique los detalles del tote registrado. La fecha de ingreso original se mantiene.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="codigoIdentificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Identificación</FormLabel>
                    <FormControl>
                      <Input placeholder="TOTE-XXX-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Material</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(tipoMaterialTranslations).map(([key, value]) => (
                           <SelectItem key={key} value={key as Tote["tipoMaterial"]}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unidadCapacidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Litros">Litros</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="estadoActual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Actual</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {Object.entries(estadoToteTranslations).map(([key, value]) => (
                           <SelectItem key={key} value={key as Tote["estadoActual"]}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Bodega Principal, Zona A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaAdquisicion"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Ingreso (Automática)</FormLabel>
                     <Input
                        type="text"
                        value={field.value && isValid(field.value) ? format(field.value, "PPP p", { locale: es }) : "Fecha inválida"}
                        readOnly
                        disabled
                        className="cursor-not-allowed bg-muted/50"
                      />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaRetornoPrevista"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Retorno Prevista</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && isValid(parseISO(field.value)) ? (
                              format(parseISO(field.value), "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha (opcional)</span>
                            )}
                            <CalendarLucideIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Información relevante sobre el tote..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
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
