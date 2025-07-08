
'use server';

import { z } from "zod";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { mockUsers } from "@/data/mock-data";

// Esta interfaz define la estructura de los datos del usuario que guardamos en la sesión.
export interface UserSessionData {
  userId: string | number;
  username: string;
  email?: string;
  nombre: string;
  rol: string;
}

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario es obligatorio." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginResult {
  success: boolean;
  error?: string;
}

// =================================================================
// PUNTO DE CONTROL DE SESIÓN 1: CREACIÓN DE LA SESIÓN
// Esta función, `loginUser`, es donde se INICIA la sesión.
// Después de validar las credenciales, convierte los datos del usuario a JSON
// y usa `cookies().set()` para crear la cookie de autenticación que el navegador guardará.
// =================================================================
export async function loginUser(credentials: LoginFormValues): Promise<LoginResult> {
  const validation = loginFormSchema.safeParse(credentials);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: `Datos de entrada inválidos: ${errorMessages}` };
  }

  const { username, password } = validation.data;

  // --- Hardcoded Admin Check (siempre disponible) ---
  if (username.toLowerCase() === 'adm') {
    if (password === '123') {
      const sessionData: UserSessionData = {
          userId: 'adm_user',
          username: 'adm',
          email: 'adm@dicipware.com',
          nombre: 'Administrador del Sistema',
          rol: 'Admin',
      };
      
      const sessionValue = JSON.stringify(sessionData);
      cookies().set(AUTH_COOKIE_NAME, sessionValue, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 semana
          secure: process.env.NODE_ENV === 'production',
      });
      redirect('/');
    } else {
      return { success: false, error: "Contraseña incorrecta para el usuario 'adm'." };
    }
  }

  // --- Verificación de usuario en modo de demostración ---
  const mockUser = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!mockUser) {
    return { success: false, error: "Nombre de usuario no encontrado." };
  }

  if (mockUser.status !== 'Active') {
    return { success: false, error: `La cuenta del usuario '${username}' está inactiva.` };
  }

  if (mockUser.password !== password) {
    return { success: false, error: "Contraseña incorrecta." };
  }

  // Si todas las comprobaciones pasan, el inicio de sesión es exitoso
  const sessionData: UserSessionData = {
      userId: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      nombre: mockUser.name,
      rol: mockUser.role,
  };

  const sessionValue = JSON.stringify(sessionData);
  cookies().set(AUTH_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      secure: process.env.NODE_ENV === 'production',
  });
  
  redirect('/');
}


// =================================================================
// PUNTO DE CONTROL DE SESIÓN 2: DESTRUCCIÓN DE LA SESIÓN
// Esta función, `logoutUser`, es donde se CIERRA la sesión.
// Simplemente elimina la cookie de autenticación del navegador.
// =================================================================
export async function logoutUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (sessionCookie) {
    console.log(`[LogoutAction] Deleting cookie ${AUTH_COOKIE_NAME}.`);
    cookieStore.delete(AUTH_COOKIE_NAME, { path: '/' });
  } else {
    console.log("[LogoutAction] No session cookie found to delete.");
  }
  console.log(`[LogoutAction] Redirecting to /login from server action.`);
  redirect('/login');
}
