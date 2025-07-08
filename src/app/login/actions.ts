
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
  username: z.string().min(1, { message: "El nombre de usuario o email es obligatorio." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginUser(credentials: LoginFormValues): Promise<LoginResult> {
  const validation = loginFormSchema.safeParse(credentials);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: `Datos de entrada inválidos: ${errorMessages}` };
  }

  const { username, password } = validation.data;
  const loginIdentifier = username.toLowerCase();

  const user = mockUsers.find(
    u => u.username.toLowerCase() === loginIdentifier || (u.email && u.email.toLowerCase() === loginIdentifier)
  );

  if (!user) {
    return { success: false, error: "Usuario o email no encontrado." };
  }

  if (user.status !== 'Active') {
    return { success: false, error: `La cuenta del usuario '${user.username}' está inactiva.` };
  }

  if (user.password !== password) {
    return { success: false, error: "Contraseña incorrecta." };
  }

  // Si todas las comprobaciones pasan, el inicio de sesión es exitoso
  const sessionData: UserSessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      nombre: user.name,
      rol: user.role,
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
