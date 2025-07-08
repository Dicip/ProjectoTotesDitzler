
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Aunque la redirección principal es desde el server action
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loginUser } from "./actions";
import { useTheme } from "@/components/theme-provider";

const loginClientSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario o email es obligatorio." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

type LoginFormValues = z.infer<typeof loginClientSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toggleTheme } = useTheme();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginClientSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    console.log("[LoginPage] Submitting login form with data:", data);
    try {
      // La Server Action 'loginUser' maneja la redirección con redirect() en caso de éxito.
      // Si hay un error, lo devolverá y se mostrará aquí.
      const result = await loginUser(data);

      if (result && !result.success && result.error) {
        console.log("[LoginPage] Login failed with error from action:", result.error);
        setError(result.error);
        setIsLoading(false); // Detener el spinner en caso de error explícito
      }
      // Si la acción redirige, este código no se alcanzará o no tendrá efecto.
      // Si la acción *no* redirige Y *no* devuelve un error (improbable para login),
      // entonces setIsLoading(false) podría ser necesario, pero la redirección es prioritaria.

    } catch (err: any) {
      // Este catch block maneja errores si la Server Action misma lanza una excepción NO manejada
      // o si es un error especial de Next.js como 'NEXT_REDIRECT'.
      if (err.message && err.message.includes('NEXT_REDIRECT')) {
        // Esto es un "error" esperado cuando ocurre una redirección desde la server action.
        // Next.js lo maneja internamente para efectuar la redirección. No es un error real para el usuario.
        console.log("[LoginPage] Server-side redirect occurred. Client-side navigation/state update skipped.");
        // No es necesario llamar a setIsLoading(false) aquí, ya que la página se recargará/navegará.
        return;
      } else {
        console.error("[LoginPage] Login submission error (exception caught):", err);
        setError(err.message || "Ocurrió un error inesperado. Intente nuevamente.");
        setIsLoading(false); // Detener el spinner en caso de excepción
      }
    }
    // setIsLoading(false) aquí podría ser redundante si hay redirección o un error manejado arriba.
    // Si la acción no redirige y no da error, se podría necesitar aquí.
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
