
"use server";

import type { Tote, ToteFormData } from "./schema";
import { mockTotes } from "@/data/mock-data";
import {formatISO, startOfDay} from "date-fns";

export async function fetchTotes(): Promise<Tote[]> {
  console.log("[DEMO_MODE] Serving mock totes.");
  return mockTotes;
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
