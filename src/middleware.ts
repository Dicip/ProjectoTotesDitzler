import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// =================================================================
// PUNTO DE CONTROL DE SESIÓN: VALIDACIÓN DE LA SESIÓN (SIMPLIFICADO)
// Este middleware es el guardián de tus rutas. Se ejecuta ANTES de cada solicitud.
// Su trabajo es leer la cookie de autenticación y redirigir al usuario según su estado.
// =================================================================
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // CASO 1: Usuario autenticado intenta acceder a una página pública (ej: /login).
  // Lo redirigimos a la página principal del panel ('/').
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // CASO 2: Usuario NO autenticado intenta acceder a una página protegida.
  // Lo redirigimos al login.
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CASO 3: En cualquier otro caso (usuario autenticado en ruta protegida,
  // o usuario no autenticado en ruta pública), permitimos que la solicitud continúe.
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
