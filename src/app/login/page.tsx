"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { LogIn, AlertCircle, Sun, Moon } from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/components/theme-provider";

import type { UserSessionData } from "./actions";
import type { User } from "@/app/(app)/usuarios/schema";
import type { LogEntry } from "@/app/(app)/registro-cambios/schema";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { mockUsers, mockLogs } from "@/data/mock-data";


const loginClientSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario o email es obligatorio." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

type LoginFormValues = z.infer<typeof loginClientSchema>;

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toggleTheme } = useTheme();

  React.useEffect(() => {
    // This is a safeguard to ensure mock data exists for the login page to function
    // if the user's local storage has been cleared.
    try {
        const users = window.localStorage.getItem("dicipware_users");
        if (!users || JSON.parse(users).length === 0) {
            window.localStorage.setItem("dicipware_users", JSON.stringify(mockUsers));
        }
        const logs = window.localStorage.getItem("dicipware_logs");
        if (!logs) {
            window.localStorage.setItem("dicipware_logs", JSON.stringify(mockLogs));
        }
    } catch (e) {
        // If parsing fails, reset the data
        console.warn("Failed to parse localStorage data, resetting.", e);
        window.localStorage.setItem("dicipware_users", JSON.stringify(mockUsers));
        window.localStorage.setItem("dicipware_logs", JSON.stringify(mockLogs));
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginClientSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const usersJSON = window.localStorage.getItem("dicipware_users");
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : mockUsers;

      const loginIdentifier = data.username.toLowerCase();
      
      const user = users.find(u => {
        if (!u || !u.username) return false;
        const usernameMatch = u.username.toLowerCase() === loginIdentifier;
        const emailMatch = u.email && u.email.toLowerCase() === loginIdentifier;
        return usernameMatch || emailMatch;
      });

      if (!user) {
        throw new Error("Usuario o email no encontrado.");
      }
      if (user.status !== 'Active') {
        throw new Error(`La cuenta del usuario '${user.username}' está inactiva.`);
      }
      if (user.password !== data.password) {
        throw new Error("Contraseña incorrecta.");
      }

      // Create log entry for successful login
      try {
        const logsJSON = window.localStorage.getItem("dicipware_logs");
        const currentLogs: LogEntry[] = logsJSON ? JSON.parse(logsJSON) : mockLogs;
        const newLogEntry: LogEntry = {
          id: `log_${new Date().getTime()}`,
          fecha: new Date().toISOString(),
          usuario: user.name,
          accion: 'Login',
          entidad: 'Autenticación',
          descripcion: 'Inicio de sesión exitoso.',
        };
        const updatedLogs = [newLogEntry, ...currentLogs];
        window.localStorage.setItem("dicipware_logs", JSON.stringify(updatedLogs));
      } catch (logError) {
        console.error("Failed to write login event to log:", logError);
      }
      
      const sessionData: UserSessionData = {
        userId: user.id,
        username: user.username,
        email: user.email,
        nombre: user.name,
        rol: user.role,
      };
      const sessionValue = JSON.stringify(sessionData);
      
      const maxAge = 60 * 60 * 24 * 7; // 1 week
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(sessionValue)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Use full page navigation to ensure the cookie is sent to the server
      // and the middleware can properly authenticate the new session.
      window.location.assign('/');

    } catch (err: any) {
      console.error("[LoginPage] Login submission error:", err);
      setError(err.message || "Ocurrió un error inesperado. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="absolute inset-0 z-[-1]">
        <Image 
          src="/img/fondo2.jpg"
          alt="Imagen de fondo de la aplicación"
          fill
          style={{ objectFit: 'cover' }}
          quality={90}
          priority
          data-ai-hint="background"
        />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
      </div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl bg-card/90 dark:bg-card backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/img/logo.jpg"
                alt="Ditzler Chile Logo"
                width={180}
                height={45}
                data-ai-hint="logo"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Bienvenido a Ditzler Chile</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Inicio de Sesión</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario o Email</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="ej: amartinez o adm" {...field} />
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
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Ingresando..." : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
