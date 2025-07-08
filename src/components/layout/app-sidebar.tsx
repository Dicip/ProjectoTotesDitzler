
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Briefcase, Settings, Moon, Sun, LogOut, UserCircle, History } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/app/login/actions";


export function AppSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const menuItems = [
    { href: "/", label: "Panel de control", icon: LayoutDashboard },
    { href: "/totes", label: "Totes", icon: Package },
    { href: "/usuarios", label: "Usuarios", icon: Users },
    { href: "/clientes", label: "Clientes", icon: Briefcase },
    { href: "/registro-cambios", label: "Registro de Cambios", icon: History },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      
      toast({ title: "Sesión cerrada", description: "Ha cerrado sesión exitosamente." });
      
      // Force a full page reload to ensure the middleware re-evaluates the authentication state
      // and clears any client-side state.
      window.location.href = '/login';

    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    }
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Button variant="ghost" size="icon" className="h-10 w-10 mx-auto mb-2 hidden group-data-[collapsible=icon]:flex">
          <Image src="/img/logo.jpg" alt="Ditzler Chile Logo" width={32} height={32} data-ai-hint="logo icon" />
          <span className="sr-only">Ditzler Chile</span>
        </Button>
        <div className="flex items-center justify-center group-data-[collapsible=icon]:hidden px-2 py-2">
           <Image src="/img/logo.jpg" alt="Ditzler Chile Logo" width={180} height={45} data-ai-hint="logo" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
             <SidebarMenuButton tooltip="Cerrar Sesión" onClick={handleLogout} className="w-full">
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Configuración" className="w-full">
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" className="w-56 mb-1">
                 <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
                    <div className="flex items-center justify-between w-full py-1">
                        <Label htmlFor="dark-mode-toggle" className="flex items-center cursor-pointer text-sm text-foreground">
                        {theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                        Modo Oscuro
                        </Label>
                        <Switch
                        id="dark-mode-toggle"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                        aria-label="Toggle dark mode"
                        />
                    </div>
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
