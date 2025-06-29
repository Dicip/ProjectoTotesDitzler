
"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
// No es necesario importar useRouter, pathname o AUTH_COOKIE_NAME aquí,
// ya que el middleware se encarga de la protección de rutas.

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // El useEffect para la comprobación de cookies del lado del cliente se elimina,
  // ya que el middleware es el principal responsable de la lógica de autenticación.
  // Si el middleware funciona correctamente, este componente solo se renderizará
  // si el usuario está autenticado.

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
