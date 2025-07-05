
"use server";

import type { Cliente, ClienteFormData } from "./schema";
import { mockClientes } from "@/data/mock-data";

export async function fetchClientes(): Promise<Cliente[]> {
  console.log("[DEMO_MODE] Serving mock clientes.");
  return mockClientes;
}

export async function addCliente(clienteData: ClienteFormData): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
  console.log("[DEMO_MODE] addCliente disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}

export async function updateCliente(clienteId: string, clienteData: ClienteFormData): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
  console.log("[DEMO_MODE] updateCliente disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}

export async function deleteCliente(clienteId: string): Promise<{ success: boolean; error?: string }> {
  console.log("[DEMO_MODE] deleteCliente disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}
