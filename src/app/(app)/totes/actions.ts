
"use server";

import type { Tote, ToteFormData } from "./schema";
import { mockTotes } from "@/data/mock-data";

export async function fetchTotes(): Promise<Tote[]> {
  console.log("[DEMO_MODE] Serving mock totes.");
  return mockTotes;
}

export async function updateTote(toteId: string, toteData: ToteFormData): Promise<{ success: boolean; error?: string; tote?: Tote }> {
  console.log("[DEMO_MODE] updateTote disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}

export async function deleteTote(toteId: string): Promise<{ success: boolean; error?: string }> {
  console.log("[DEMO_MODE] deleteTote disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}
