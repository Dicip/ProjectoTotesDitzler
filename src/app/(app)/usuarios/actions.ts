
"use server";

import type { User, UserFormData } from "./schema";
import { mockUsers } from "@/data/mock-data";

export async function fetchUsers(): Promise<User[]> {
  console.log("[DEMO_MODE] Serving mock users.");
  return mockUsers;
}

export async function addUser(userData: UserFormData): Promise<{ success: boolean; error?: string; user?: User }> {
  console.log("[DEMO_MODE] addUser disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}

export async function updateUser(userId: string, userData: UserFormData): Promise<{ success: boolean; error?: string; user?: User }> {
  console.log("[DEMO_MODE] updateUser disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  console.log("[DEMO_MODE] deleteUser disabled.");
  return { success: false, error: "Esta función está deshabilitada en el modo de demostración." };
}
