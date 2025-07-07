
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import type { ChangePasswordFormData } from "./schema";
import { changePasswordFormSchema } from "./schema";
import type { UserSessionData } from "@/app/login/actions";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') {
        return undefined;
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export default function PerfilPage() {
  const [session, setSession] = React.useState<UserSessionData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const cookieValue = getCookie(AUTH_COOKIE_NAME);
    if (cookieValue) {
      try {
        const sessionData: UserSessionData = JSON.parse(decodeURIComponent(cookieValue));
        setSession(sessionData);
      } catch (e) {
        console.error("Failed to parse session cookie", e);
      }
    }
    setIsLoading(false);
  }, []);
  
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    // Simulate API call
    console.log("Simulating password change with data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Contraseña Actualizada",
      description: "Su contraseña ha sido actualizada exitosamente (simulación).",
    });
    form.reset();
  };

  if (isLoading || !session) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
                <CardHeader className="flex flex-col items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-40 mt-4" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                 <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-32 ml-auto" />
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <UserCircle className="mr-2 h-6 w-6" />
                Mi Perfil
            </CardTitle>
            <CardDescription>
                Revise y administre su información personal y de seguridad.
            </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={`https://placehold.co/96x96.png?text=${session.nombre.substring(0, 1)}`} alt={session.nombre} data-ai-hint="user initial" />
              <AvatarFallback>{session.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{session.nombre}</h2>
            <p className="text-muted-foreground">@{session.username}</p>
             {session.email && (
                <p className="text-xs text-muted-foreground/80 mt-1">{session.email}</p>
            )}
          </CardHeader>
          <CardContent className="text-sm">
             <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Badge variant="secondary">{session.rol}</Badge>
                <p className="font-medium">Rol del Sistema</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Cambiar Contraseña
            </CardTitle>
            <CardDescription>
              Para mayor seguridad, use una contraseña que no utilice en otros sitios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña Actual</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
