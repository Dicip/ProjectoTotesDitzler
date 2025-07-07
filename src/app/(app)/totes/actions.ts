
"use server";

import type { Tote, ToteFormData } from "./schema";
import { mockTotes } from "@/data/mock-data";
import {formatISO, startOfDay} from "date-fns";

export async function fetchTotes(): Promise<Tote[]> {
  console.log("[DEMO_MODE] Serving mock totes.");
  return mockTotes;
}

export async function addTote(toteData: ToteFormData): Promise<{ success: boolean; error?: string; tote?: Tote }> {
  console.log("[DEMO_MODE] Simulating addTote.", toteData);

  // In a real scenario, you'd check for code uniqueness in the DB here.
  // The client-side localStorage implementation will handle this.

  const envasadoDate = toteData.fechaEnvasado ? new Date(toteData.fechaEnvasado) : null;
  const vencimientoDate = toteData.fechaVencimiento ? new Date(toteData.fechaVencimiento) : null;

  const newTote: Tote = {
    id: `tote_${new Date().getTime()}`,
    codigoIdentificacion: toteData.codigoIdentificacion,
    tipoMaterial: toteData.tipoMaterial,
    capacidad: toteData.capacidad,
    unidadCapacidad: toteData.unidadCapacidad,
    estadoActual: toteData.estadoActual,
    ubicacion: toteData.ubicacion,
    fechaAdquisicion: new Date().toISOString(), // Set acquisition date on creation
    producto: toteData.producto || undefined,
    clienteId: toteData.clienteId || null,
    operadorId: toteData.operadorId || null,
    lote: toteData.lote || undefined,
    fechaEnvasado: envasadoDate && !isNaN(envasadoDate.getTime()) ? envasadoDate.toISOString() : null,
    fechaVencimiento: vencimientoDate && !isNaN(vencimientoDate.getTime()) ? vencimientoDate.toISOString() : null,
    fechaDespacho: null, // Despacho date is set when status changes to "Con Cliente"
    notas: toteData.notas || undefined,
  };

  return { success: true, tote: newTote };
}


export async function updateTote(toteId: string, toteData: ToteFormData): Promise<{ success: boolean; error?: string; tote?: Tote }> {
  console.log(`[DEMO_MODE] Simulating updateTote for toteId: ${toteId}`, toteData);

    const toteIndex = mockTotes.findIndex(t => t.id === toteId);
    if (toteIndex === -1) {
        return { success: false, error: "Tote no encontrado." };
    }

    const originalTote = mockTotes[toteIndex];

    // Lógica para establecer fecha de despacho si el estado cambia a "Con Cliente"
    let fechaDespacho = originalTote.fechaDespacho;
    if (toteData.estadoActual === 'Con Cliente' && originalTote.estadoActual !== 'Con Cliente') {
        fechaDespacho = startOfDay(new Date()).toISOString();
    } else if (toteData.estadoActual !== 'Con Cliente') {
        fechaDespacho = null; // Limpiar fecha de despacho si ya no está con el cliente
    }

    const envasadoDate = toteData.fechaEnvasado ? new Date(toteData.fechaEnvasado) : null;
    const vencimientoDate = toteData.fechaVencimiento ? new Date(toteData.fechaVencimiento) : null;

    const updatedTote: Tote = {
        ...originalTote,
        codigoIdentificacion: toteData.codigoIdentificacion,
        tipoMaterial: toteData.tipoMaterial,
        capacidad: toteData.capacidad,
        unidadCapacidad: toteData.unidadCapacidad,
        estadoActual: toteData.estadoActual,
        ubicacion: toteData.ubicacion,
        notas: toteData.notas || undefined,
        // Nuevos campos
        producto: toteData.producto || undefined,
        clienteId: toteData.clienteId || null,
        operadorId: toteData.operadorId || null,
        lote: toteData.lote || undefined,
        fechaEnvasado: envasadoDate && !isNaN(envasadoDate.getTime()) ? envasadoDate.toISOString() : null,
        fechaVencimiento: vencimientoDate && !isNaN(vencimientoDate.getTime()) ? vencimientoDate.toISOString() : null,
        fechaDespacho: fechaDespacho,
    };

    return { success: true, tote: updatedTote };
}

export async function deleteTote(toteId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[DEMO_MODE] Simulating deleteTote for toteId: ${toteId}`);

  const toteIndex = mockTotes.findIndex(t => t.id === toteId);

  if (toteIndex === -1) {
    return { success: false, error: "Tote no encontrado." };
  }
  
  return { success: true };
}
