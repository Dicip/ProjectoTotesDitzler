
'use server';

import { z } from "zod";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { mockUsers } from "@/data/mock-data";

// Esta interfaz define la estructura de los datos del usuario que guardamos en la sesión.
export interface UserSessionData {
  userId: string;
  email: string;
  nombre: string;
  rol: string;
}

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, ingrese un email válido." }),
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

  const { email, password } = validation.data;
  const lowercasedEmail = email.toLowerCase();

  let sessionData: UserSessionData | null = null;

  // --- Hardcoded Admin Check (always available) ---
  if (lowercasedEmail === 'adm' && password === '123') { // Kept 'adm' as a special username case for convenience
    sessionData = {
        userId: 'adm_user',
        email: 'adm@dicipware.com',
        nombre: 'Administrador del Sistema',
        rol: 'Admin',
    };
    console.log(`[DEMO_MODE] 'adm' user authenticated successfully.`);
  } else {
    // --- DEMO MODE USER CHECK ---
    console.log("[DEMO_MODE] Attempting mock user login with email.");
    const mockUser = mockUsers.find(u => u.email?.toLowerCase() === lowercasedEmail);
    
    if (mockUser && mockUser.password === password && mockUser.status === 'Active') {
        sessionData = {
            userId: mockUser.id,
            email: mockUser.email!,
            nombre: mockUser.name,
            rol: mockUser.role,
        };
        console.log(`[DEMO_MODE] Mock user ${mockUser.email} authenticated successfully.`);
    }
  }
  
  // Handle 'adm' as a special case for login form if email is 'adm'
  if (!sessionData && lowercasedEmail === 'adm' && password === '123') {
     sessionData = {
        userId: 'adm_user',
        email: 'adm@dicipware.com',
        nombre: 'Administrador del Sistema',
        rol: 'Admin',
    };
  }


  if (sessionData) {
    const sessionValue = JSON.stringify(sessionData);
    console.log(`[LoginAction] Setting auth cookie for '${sessionData.email}' with value: ${sessionValue}`);
    cookies().set(AUTH_COOKIE_NAME, sessionValue, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production',
    });
    redirect('/');
  }

  // This part is only reached if authentication fails at all stages
  return { success: false, error: "Credenciales inválidas." };
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
