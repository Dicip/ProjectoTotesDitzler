'use server';

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// Esta interfaz define la estructura de los datos del usuario que guardamos en la sesión.
// Las acciones de servidor se han movido a lógica del lado del cliente para
// funcionar correctamente con el modo de demostración basado en LocalStorage.
export interface UserSessionData {
  userId: string | number;
  username: string;
  email?: string;
  nombre: string;
  rol: string;
}

export async function logout() {
  try {
    cookies().delete(AUTH_COOKIE_NAME);
  } catch (error) {
    console.error("Failed to delete auth cookie", error);
    // Optionally re-throw or handle the error
    throw new Error("Could not log out.");
  }
}
