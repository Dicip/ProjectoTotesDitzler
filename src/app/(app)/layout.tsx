
"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { mockUsers, mockClientes, mockTotes, mockLogs } from "@/data/mock-data";


// This is a one-time setup effect to ensure the demo data exists in localStorage.
// It checks if the data for users, clients, or totes is missing or empty, and if so,
// it seeds localStorage with the initial mock data.
const initializeDemoData = () => {
  try {
    const dataKeys = {
      dicipware_users: mockUsers,
      dicipware_clientes: mockClientes,
      dicipware_totes: mockTotes,
      dicipware_logs: mockLogs,
    };

    for (const [key, mockData] of Object.entries(dataKeys)) {
      const storedItem = window.localStorage.getItem(key);
      if (!storedItem) {
         window.localStorage.setItem(key, JSON.stringify(mockData));
      } else {
        try {
          const parsed = JSON.parse(storedItem);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            window.localStorage.setItem(key, JSON.stringify(mockData));
          }
        } catch (e) {
          // If parsing fails, the data is likely corrupt, so we reset it.
          window.localStorage.setItem(key, JSON.stringify(mockData));
        }
      }
    }
  } catch (error) {
    console.error("Failed to initialize demo data in localStorage:", error);
  }
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  // The useEffect for checking and seeding demo data runs once on mount.
  React.useEffect(() => {
    initializeDemoData();
  }, []); // The empty dependency array ensures this runs only once when the layout mounts.

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
