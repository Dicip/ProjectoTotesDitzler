
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Briefcase, AlertCircle, RefreshCw } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import type { Cliente, ClienteFormData } from "./schema";
import { clienteFormSchema } from "./schema";
import { fetchClientes, addCliente, updateCliente, deleteCliente } from "./actions";


const tipoClienteTranslations: Record<Cliente["tipo"], string> = {
  Mayorista: "Mayorista",
  Minorista: "Minorista",
  Distribuidor: "Distribuidor",
};

const estadoClienteTranslations: Record<Cliente["estado"], string> = {
  Activo: "Activo",
  Inactivo: "Inactivo",
};

export default function ClientesPage() {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddOrEditClienteDialogOpen, setIsAddOrEditClienteDialogOpen] = React.useState(false);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingClienteId, setDeletingClienteId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nombreEmpresa: "",
      contactoPrincipal: "",
      emailContacto: "",
      telefono: "",
      tipo: "Minorista",
      estado: "Activo",
    },
  });

  const loadClientes = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedClientes = await fetchClientes();
      setClientes(fetchedClientes);
    } catch (e: any) {
      setError(e.message || "No se pudieron cargar los clientes.");
      toast({ variant: "destructive", title: "Error", description: e.message || "No se pudieron cargar los clientes." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  React.useEffect(() => {
    if (editingCliente) {
      form.reset(editingCliente);
    } else {
      form.reset({ nombreEmpresa: "", contactoPrincipal: "", emailContacto: "", telefono: "", tipo: "Minorista", estado: "Activo" });
    }
  }, [editingCliente, form, isAddOrEditClienteDialogOpen]);


  const handleOpenAddClienteDialog = () => {
    setEditingCliente(null);
    // form.reset is handled by useEffect
    setIsAddOrEditClienteDialogOpen(true);
  };

  const handleOpenEditClienteDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    // form.reset is handled by useEffect
    setIsAddOrEditClienteDialogOpen(true);
  };

  const handleOpenDeleteDialog = (clienteId: string) => {
    setDeletingClienteId(clienteId);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: ClienteFormData) => {
    form.formState.isSubmitting;
    try {
      if (editingCliente) {
        const result = await updateCliente(editingCliente.id, data);
        if (result.success && result.cliente) {
          setClientes(clientes.map((c) => (c.id === result.cliente!.id ? result.cliente! : c)));
          toast({ title: "Cliente actualizado", description: `El cliente ${result.cliente.nombreEmpresa} ha sido actualizado.` });
        } else {
          throw new Error(result.error || "No se pudo actualizar el cliente.");
        }
      } else {
        const result = await addCliente(data);
         if (result.success && result.cliente) {
          setClientes([result.cliente!, ...clientes]);
          toast({ title: "Cliente agregado", description: `El cliente ${result.cliente.nombreEmpresa} ha sido agregado.` });
        } else {
          throw new Error(result.error || "No se pudo agregar el cliente.");
        }
      }
      setIsAddOrEditClienteDialogOpen(false);
      setEditingCliente(null);
      await loadClientes(); // Refresh list
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteCliente = async () => {
    if (deletingClienteId) {
      const clienteToDelete = clientes.find(c => c.id === deletingClienteId);
      form.formState.isSubmitting;
      try {
        const result = await deleteCliente(deletingClienteId);
        if (result.success) {
          setClientes(clientes.filter((c) => c.id !== deletingClienteId));
          toast({ title: "Cliente eliminado", description: `El cliente ${clienteToDelete?.nombreEmpresa || ''} ha sido eliminado.`, variant: "destructive" });
        } else {
          throw new Error(result.error || "No se pudo eliminar el cliente.");
        }
      } catch (e: any) {
         toast({ variant: "destructive", title: "Error", description: e.message });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingClienteId(null);
        await loadClientes(); // Refresh list
      }
    }
  };

  const sortedClientes = React.useMemo(() => {
    return [...clientes].sort((a,b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa));
  }, [clientes]);

  if (isLoading && clientes.length === 0) {
     return (
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-8 w-1/3" /> <Skeleton className="h-10 w-36" />
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
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-6 w-6" />
            Gestión de Clientes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadClientes} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Recargar</span>
            </Button>
            <Button onClick={handleOpenAddClienteDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Cliente
            </Button>
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
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Nombre Empresa</TableHead>
                <TableHead>Contacto Principal</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && clientes.length === 0 ? (
                 <TableRow><TableCell colSpan={8} className="h-24 text-center">Cargando clientes...</TableCell></TableRow>
              ) : !isLoading && clientes.length === 0 && !error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No hay clientes para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                sortedClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={cliente.logoUrl || `https://placehold.co/40x40.png?text=${cliente.nombreEmpresa.substring(0,1)}`} alt={cliente.nombreEmpresa} data-ai-hint="company logo" />
                        <AvatarFallback>{cliente.nombreEmpresa.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{cliente.nombreEmpresa}</TableCell>
                    <TableCell>{cliente.contactoPrincipal}</TableCell>
                    <TableCell>{cliente.emailContacto}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{tipoClienteTranslations[cliente.tipo]}</TableCell>
                    <TableCell>
                      <Badge variant={cliente.estado === "Activo" ? "default" : "secondary"}>
                        {estadoClienteTranslations[cliente.estado]}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => handleOpenEditClienteDialog(cliente)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(cliente.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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

      <Dialog open={isAddOrEditClienteDialogOpen} onOpenChange={setIsAddOrEditClienteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCliente ? "Editar Cliente" : "Agregar Nuevo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingCliente ? "Modifique los detalles del cliente." : "Complete los detalles para crear un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nombreEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la Empresa S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactoPrincipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailContacto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del Contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+56912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mayorista">{tipoClienteTranslations.Mayorista}</SelectItem>
                        <SelectItem value="Minorista">{tipoClienteTranslations.Minorista}</SelectItem>
                        <SelectItem value="Distribuidor">{tipoClienteTranslations.Distribuidor}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Activo">{estadoClienteTranslations.Activo}</SelectItem>
                        <SelectItem value="Inactivo">{estadoClienteTranslations.Inactivo}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <DialogClose asChild>
                   <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : (editingCliente ? "Guardar Cambios" : "Crear Cliente")}
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingClienteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCliente} className={cn(buttonVariants({ variant: "destructive" }))} disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
