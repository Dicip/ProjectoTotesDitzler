
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Briefcase } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { mockClientes, mockLogs } from "@/data/mock-data";
import type { Cliente, ClienteFormData } from "./schema";
import { clienteFormSchema } from "./schema";
import type { LogEntry } from "../registro-cambios/schema";
import type { UserSessionData } from "@/app/login/actions";
import { AUTH_COOKIE_NAME } from "@/lib/constants";


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
  const [isClient, setIsClient] = React.useState(false);
  const [clientes, setClientes] = useLocalStorage<Cliente[]>("dicipware_clientes", mockClientes);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>("dicipware_logs", mockLogs);
  const [sessionUser, setSessionUser] = React.useState<UserSessionData | null>(null);
  const [isAddOrEditClienteDialogOpen, setIsAddOrEditClienteDialogOpen] = React.useState(false);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingClienteId, setDeletingClienteId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    // Get session user from cookie
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${AUTH_COOKIE_NAME}=`))
        ?.split('=')[1];

    if (cookieValue) {
        try {
            const decodedCookie = decodeURIComponent(cookieValue);
            setSessionUser(JSON.parse(decodedCookie));
        } catch (e) {
            console.error("Failed to parse session cookie", e);
            setSessionUser(null);
        }
    }
  }, []);

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

  React.useEffect(() => {
    if (editingCliente) {
      form.reset(editingCliente);
    } else {
      form.reset({ nombreEmpresa: "", contactoPrincipal: "", emailContacto: "", telefono: "", tipo: "Minorista", estado: "Activo" });
    }
  }, [editingCliente, form, isAddOrEditClienteDialogOpen]);


  const handleOpenAddClienteDialog = () => {
    setEditingCliente(null);
    setIsAddOrEditClienteDialogOpen(true);
  };

  const handleOpenEditClienteDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsAddOrEditClienteDialogOpen(true);
  };

  const handleOpenDeleteDialog = (clienteId: string) => {
    setDeletingClienteId(clienteId);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (editingCliente) {
        const updatedCliente: Cliente = { ...editingCliente, ...data };
        setClientes(clientes.map((c) => (c.id === editingCliente.id ? updatedCliente : c)));
        
        const logEntry: LogEntry = {
          id: `log_${new Date().getTime()}`,
          fecha: new Date().toISOString(),
          usuario: sessionUser?.nombre || "Sistema",
          accion: 'Edición',
          entidad: 'Cliente',
          descripcion: `Se actualizó la información del cliente: ${data.nombreEmpresa}.`,
        };
        setLogs(prevLogs => [logEntry, ...prevLogs]);

        toast({ title: "Cliente actualizado", description: `El cliente ${data.nombreEmpresa} ha sido actualizado.` });
      } else {
        const existingCliente = clientes.find(c => c.nombreEmpresa.toLowerCase() === data.nombreEmpresa.toLowerCase());
        if (existingCliente) {
          throw new Error("Ya existe un cliente con este nombre de empresa.");
        }
        const newCliente: Cliente = {
          id: `cli_${new Date().getTime()}`,
          ...data,
          logoUrl: `https://placehold.co/40x40.png?text=${data.nombreEmpresa.substring(0,1)}`,
          fechaCreacion: new Date().toISOString(),
        };
        setClientes([newCliente, ...clientes]);
        
        const logEntry: LogEntry = {
          id: `log_${new Date().getTime()}`,
          fecha: new Date().toISOString(),
          usuario: sessionUser?.nombre || "Sistema",
          accion: 'Creación',
          entidad: 'Cliente',
          descripcion: `Se creó el nuevo cliente: ${data.nombreEmpresa}.`,
        };
        setLogs(prevLogs => [logEntry, ...prevLogs]);

        toast({ title: "Cliente agregado", description: `El cliente ${data.nombreEmpresa} ha sido agregado.` });
      }
      setIsAddOrEditClienteDialogOpen(false);
      setEditingCliente(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteCliente = async () => {
    if (deletingClienteId) {
      const clienteToDelete = clientes.find(c => c.id === deletingClienteId);
      try {
        setClientes(clientes.filter((c) => c.id !== deletingClienteId));

        const logEntry: LogEntry = {
          id: `log_${new Date().getTime()}`,
          fecha: new Date().toISOString(),
          usuario: sessionUser?.nombre || "Sistema",
          accion: 'Eliminación',
          entidad: 'Cliente',
          descripcion: `Se eliminó al cliente "${clienteToDelete?.nombreEmpresa || ''}".`,
        };
        setLogs(prevLogs => [logEntry, ...prevLogs]);

        toast({ title: "Cliente eliminado", description: `El cliente ${clienteToDelete?.nombreEmpresa || ''} ha sido eliminado.`, variant: "destructive" });
      } catch (e: any) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el cliente." });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingClienteId(null);
      }
    }
  };

  const sortedClientes = React.useMemo(() => {
    return [...clientes].sort((a,b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa));
  }, [clientes]);

  if (!isClient) {
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
            <Button onClick={handleOpenAddClienteDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              {clientes.length === 0 ? (
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
