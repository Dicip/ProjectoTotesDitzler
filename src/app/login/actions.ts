
'use server';

import sql from "mssql";
import { z } from "zod";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sqlConfig } from "@/lib/db-config";
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { mockUsers } from "@/data/mock-data";

// Esta interfaz define la estructura de los datos del usuario que guardamos en la sesión.
export interface UserSessionData {
  userId: string | number;
  email: string;
  nombre: string;
  rol: string;
}

const loginFormSchema = z.object({
  email: z.string().min(1, { message: "El email/usuario es obligatorio." })
    .refine(value => {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'adm') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }, {
      message: "Por favor, ingrese un email válido o 'adm'.",
    }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginResult {
  success: boolean;
  error?: string;
}

const checkDbConfig = () => {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return;
  }
  if (!sqlConfig.server || !sqlConfig.user || !sqlConfig.database || !sqlConfig.password) {
    throw new Error("La configuración de la base de datos está incompleta. Por favor, revise las variables de entorno en el archivo .env.local y reinicie el servidor.");
  }
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

  let sessionData: UserSessionData | null = null;

  // --- Hardcoded Admin Check (always available) ---
  if (email.toLowerCase() === 'adm' && password === '123') {
    sessionData = {
        userId: 'adm_user',
        email: 'adm@dicipware.com',
        nombre: 'Administrador del Sistema',
        rol: 'Admin',
    };
    console.log(`[LoginAction] 'adm' user authenticated successfully.`);
  } else if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    // --- OFFLINE MODE USER CHECK ---
    console.log("[OFFLINE_MODE] Attempting mock user login.");
    const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // For demo, any password works if the user exists and is active.
    if (mockUser && mockUser.status === 'Active') {
        sessionData = {
            userId: mockUser.id,
            email: mockUser.email,
            nombre: mockUser.name,
            rol: mockUser.role,
        };
        console.log(`[OFFLINE_MODE] Mock user ${mockUser.email} authenticated successfully.`);
    }
  } else {
    // --- Database User Check (Online Mode) ---
    checkDbConfig(); // Proactive check
    let pool: sql.ConnectionPool | null = null;
    try {
      pool = await sql.connect(sqlConfig);
      const result = await pool.request()
        .input('Email', sql.NVarChar, credentials.email)
        .query('SELECT Id, Email, NombreCompleto, Rol, PasswordHash, Estado FROM Usuarios WHERE Email = @Email');

      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        if (user.Estado === 'Active' && password === user.PasswordHash) { // INSECURE, for dev only
          sessionData = {
            userId: user.Id,
            email: user.Email,
            nombre: user.NombreCompleto,
            rol: user.Rol,
          };
          console.log(`[LoginAction] DB user ${user.Email} authenticated successfully.`);
        }
      }
    } catch (error) {
      console.error("[LoginAction] Database error during login:", error);
      // We don't want to expose DB errors to the user, the generic "invalid credentials" is enough.
      // But if it's our config error, we show it.
      if (error instanceof Error && error.message.includes("configuración de la base de datos")) {
         return { success: false, error: error.message };
      }
    } finally {
      if (pool) await pool.close();
    }
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
