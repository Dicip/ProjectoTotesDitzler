
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import type { UserSessionData } from './app/login/actions';

// =================================================================
// PUNTO DE CONTROL DE SESIÓN 3: VALIDACIÓN DE LA SESIÓN
// Este archivo (`middleware.ts`) es el guardián de tus rutas.
// Se ejecuta ANTES de cada solicitud a una página.
// Su trabajo es leer la cookie de autenticación (`dicipware-auth-token`),
// verificar si es válida y decidir si el usuario tiene permiso
// para ver la página solicitada. Si no, lo redirige al login.
// =================================================================
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie;

  // Si el usuario no está autenticado y visita la página raíz,
  // le mostramos el contenido de la página de login sin cambiar la URL.
  if (!isAuthenticated && pathname === '/') {
    return NextResponse.rewrite(new URL('/login', request.url));
  }

  // --- Lógica de redirección estándar ---
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // CASO 1: Usuario autenticado intenta acceder a una página pública.
  // Lo redirigimos a la página principal del panel (que es '/').
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // CASO 2: Usuario NO autenticado intenta acceder a una página protegida.
  // Lo redirigimos al login.
  if (!isAuthenticated && !isPublicPath) {
    // La reescritura de arriba ya manejó el caso de la raíz.
    // Esto se encarga de otras rutas como /totes, /usuarios, etc.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CASO 3: En cualquier otro caso, permitimos que la solicitud continúe.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     * - img (image assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|img).*)',
  ],
};
