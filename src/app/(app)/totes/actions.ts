
"use server";

import type { Tote, ToteFormData } from "./schema";
import { mockTotes } from "@/data/mock-data";

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

    // Combine data, keeping original acquisition date.
    // The form sends 'yyyy-MM-dd' for fechaRetornoPrevista, we need to convert it to ISO string for consistency.
    const updatedTote: Tote = {
        ...originalTote,
        codigoIdentificacion: toteData.codigoIdentificacion,
        tipoMaterial: toteData.tipoMaterial,
        capacidad: toteData.capacidad,
        unidadCapacidad: toteData.unidadCapacidad,
        estadoActual: toteData.estadoActual,
        ubicacion: toteData.ubicacion,
        fechaRetornoPrevista: toteData.fechaRetornoPrevista ? new Date(toteData.fechaRetornoPrevista).toISOString() : null,
        notas: toteData.notas || undefined,
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
