"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
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
import { mockUsers, mockTotes } from "@/data/mock-data";
import type { User, UserFormData } from "./schema"; 
import { userFormSchema } from "./schema";
import type { Tote } from "@/app/(app)/totes/schema";


const roleTranslations: Record<User["role"], string> = {
  Admin: "Administrador",
  Editor: "Editor",
  Viewer: "Visualizador",
};

const statusTranslations: Record<User["status"], string> = {
  Active: "Activo",
  Inactive: "Inactivo",
};

export default function UsuariosPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [users, setUsers] = useLocalStorage<User[]>("dicipware_users", mockUsers);
  const [totes, setTotes] = useLocalStorage<Tote[]>("dicipware_totes", mockTotes);
  const [isAddOrEditUserDialogOpen, setIsAddOrEditUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<UserFormData>({ 
    resolver: zodResolver(userFormSchema), 
    defaultValues: {
      name: "",
      username: "",
      email: "",
      role: "Viewer",
      status: "Active",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name,
        username: editingUser.username,
        email: editingUser.email || "",
        role: editingUser.role,
        status: editingUser.status,
        password: "",
        confirmPassword: "",
      });
    } else {
      form.reset({ name: "", username: "", email: "", role: "Viewer", status: "Active", password: "", confirmPassword: "" });
    }
  }, [editingUser, form, isAddOrEditUserDialogOpen]);


  const handleOpenAddUserDialog = () => {
    setEditingUser(null);
    setIsAddOrEditUserDialogOpen(true);
  };

  const handleOpenEditUserDialog = (user: User) => {
    setEditingUser(user);
    setIsAddOrEditUserDialogOpen(true);
  };

  const handleOpenDeleteDialog = (userId: string) => {
    setDeletingUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    if (!editingUser && (!data.password || data.password.length < 6)) {
      form.setError("password", { type: "manual", message: "La contraseña es obligatoria y debe tener al menos 6 caracteres." });
      return;
    }

    try {
      if (editingUser) {
        // Validation for uniqueness (safer version)
        if (users.some(u => u && u.username && u.username.toLowerCase() === data.username.toLowerCase() && u.id !== editingUser.id)) {
          throw new Error("Ya existe otro usuario con este nombre de usuario.");
        }
        if (data.email) {
          const emailToFind = data.email.toLowerCase();
          if (users.some(u => u && u.email && u.email.toLowerCase() === emailToFind && u.id !== editingUser.id)) {
             throw new Error("Ya existe otro usuario con este correo electrónico.");
          }
        }

        const oldId = editingUser.id;
        const newId = `usr_${data.username.toLowerCase()}`;

        const updatedUser: User = { 
          ...editingUser,
          id: newId,
          name: data.name,
          username: data.username,
          email: data.email || undefined,
          role: data.role,
          status: data.status,
          password: data.password ? data.password : editingUser.password, 
        };

        setUsers(users.map((u) => (u.id === oldId ? updatedUser : u)));
        
        // If ID changed, cascade the update to Totes' operatorId
        if (oldId !== newId) {
            setTotes(currentTotes => currentTotes.map(tote => {
                if (tote.operadorId === oldId) {
                    return { ...tote, operadorId: newId };
                }
                return tote;
            }));
        }

        toast({ title: "Usuario actualizado", description: `El usuario ${data.name} ha sido actualizado.` });

      } else {
        // Add new user (safer validation)
        if (users.some(u => u && u.username && u.username.toLowerCase() === data.username.toLowerCase())) {
          throw new Error("Ya existe un usuario con este nombre de usuario.");
        }
        if (data.email) {
          const emailToFind = data.email.toLowerCase();
          if (users.some(u => u && u.email && u.email.toLowerCase() === emailToFind)) {
             throw new Error("Ya existe un usuario con este correo electrónico.");
          }
        }
        
        const newUser: User = {
          id: `usr_${data.username.toLowerCase()}`,
          name: data.name,
          username: data.username,
          email: data.email || undefined,
          role: data.role,
          status: data.status,
          password: data.password!,
          avatar: `https://placehold.co/40x40.png?text=${data.name.substring(0,1)}`,
          createdAt: new Date().toISOString(),
          registeredBy: 'Admin Panel',
        };
        setUsers([newUser, ...users]);
        toast({ title: "Usuario agregado", description: `El usuario ${data.name} ha sido agregado.` });
      }
      setIsAddOrEditUserDialogOpen(false);
      setEditingUser(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteUser = async () => {
    if (deletingUserId) {
      const userToDelete = users.find(u => u.id === deletingUserId);
      try {
        setUsers(users.filter((u) => u.id !== deletingUserId));
        toast({ title: "Usuario eliminado", description: `El usuario ${userToDelete?.name || ''} ha sido eliminado.` });
      } catch (e: any) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario." });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingUserId(null);
      }
    }
  };
  
  const sortedUsers = React.useMemo(() => {
    // Robustly filter out any invalid user objects before sorting
    return [...users]
        .filter(user => 
            user && 
            typeof user === 'object' && 
            user.id && 
            user.name && 
            user.username &&
            user.role &&
            user.status &&
            user.createdAt
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users]);


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
            <Users className="mr-2 h-6 w-6" />
            Gestión de Usuarios
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleOpenAddUserDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No hay usuarios para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.avatar || `https://placehold.co/40x40.png?text=${user.name.substring(0,1)}`} alt={user.name} data-ai-hint="user initial" />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{roleTranslations[user.role]}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                        {statusTranslations[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt ? format(parseISO(user.createdAt), 'P', { locale: es }) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditUserDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(user.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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

      <Dialog open={isAddOrEditUserDialogOpen} onOpenChange={setIsAddOrEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Modifique los detalles del usuario. Deje la contraseña en blanco para no cambiarla." : "Complete los detalles para crear un nuevo usuario."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="ej: jdoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Repita la contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">{roleTranslations.Admin}</SelectItem>
                        <SelectItem value="Editor">{roleTranslations.Editor}</SelectItem>
                        <SelectItem value="Viewer">{roleTranslations.Viewer}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
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
                        <SelectItem value="Active">{statusTranslations.Active}</SelectItem>
                        <SelectItem value="Inactive">{statusTranslations.Inactive}</SelectItem>
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
                  {form.formState.isSubmitting ? "Guardando..." : (editingUser ? "Guardar Cambios" : "Crear Usuario")}
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingUserId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className={cn(buttonVariants({ variant: "destructive" }))} disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
