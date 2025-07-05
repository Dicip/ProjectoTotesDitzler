
"use server";

import type { Cliente, ClienteFormData } from "./schema";
import { mockClientes } from "@/data/mock-data";

export async function fetchClientes(): Promise<Cliente[]> {
  console.log("[DEMO_MODE] Serving mock clientes.");
  return mockClientes;
}

export async function addCliente(clienteData: ClienteFormData): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
  console.log("[DEMO_MODE] Simulating addCliente.", clienteData);

  const existingCliente = mockClientes.find(c => c.nombreEmpresa.toLowerCase() === clienteData.nombreEmpresa.toLowerCase());
  if (existingCliente) {
    return { success: false, error: "Ya existe un cliente con este nombre de empresa." };
  }

  const newCliente: Cliente = {
    id: `cli_${new Date().getTime()}`,
    ...clienteData,
    logoUrl: `https://placehold.co/40x40.png?text=${clienteData.nombreEmpresa.substring(0,1)}`,
    fechaCreacion: new Date().toISOString(),
  };
  
  return { success: true, cliente: newCliente };
}

export async function updateCliente(clienteId: string, clienteData: ClienteFormData): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
  console.log(`[DEMO_MODE] Simulating updateCliente for clienteId: ${clienteId}`, clienteData);
  
  const clienteIndex = mockClientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) {
    return { success: false, error: "Cliente no encontrado." };
  }

  const originalCliente = mockClientes[clienteIndex];

  const updatedCliente: Cliente = {
    ...originalCliente,
    ...clienteData,
  };
  
  return { success: true, cliente: updatedCliente };
}

export async function deleteCliente(clienteId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[DEMO_MODE] Simulating deleteCliente for clienteId: ${clienteId}`);
  
  const clienteIndex = mockClientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) {
    return { success: false, error: "Cliente no encontrado." };
  }
  
  return { success: true };
}
