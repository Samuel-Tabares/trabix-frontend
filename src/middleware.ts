import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/cambiar-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth data from cookie (set by client-side after login)
  const authCookie = request.cookies.get('trabix-auth')?.value;
  let isAuthenticated = false;
  let userRol: string | null = null;
  let requiereCambioPassword = false;

  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie);
      isAuthenticated = parsed.state?.isAuthenticated ?? false;
      userRol = parsed.state?.user?.rol ?? null;
      requiereCambioPassword =
        parsed.state?.user?.requiereCambioPassword ?? false;
    } catch {
      // Invalid cookie
    }
  }

  // Public paths: redirect to dashboard if already authenticated
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated && !requiereCambioPassword) {
      const redirectUrl =
        userRol === 'ADMIN' ? '/dashboard' : '/inicio';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Allow access to cambiar-password if authenticated but needs change
    if (pathname.startsWith('/cambiar-password') && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: redirect to login if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Force password change
  if (requiereCambioPassword && !pathname.startsWith('/cambiar-password')) {
    return NextResponse.redirect(new URL('/cambiar-password', request.url));
  }

  // Role-based access control
  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/usuarios') ||
    pathname.startsWith('/lotes') ||
    pathname.startsWith('/ventas') ||
    pathname.startsWith('/cuadres') ||
    pathname.startsWith('/stock') ||
    pathname.startsWith('/equipamiento') && !pathname.startsWith('/equipamiento-vendedor') ||
    pathname.startsWith('/fondo-recompensas') ||
    pathname.startsWith('/configuraciones') ||
    pathname.startsWith('/ventas-mayor') ||
    pathname.startsWith('/cuadres-mayor');

  const isVendedorRoute =
    pathname.startsWith('/inicio') ||
    pathname.startsWith('/vender') ||
    pathname.startsWith('/mis-lotes') ||
    pathname.startsWith('/mis-ventas') ||
    pathname.startsWith('/mis-cuadres') ||
    pathname.startsWith('/mi-equipo') ||
    pathname.startsWith('/perfil');

  if (isAdminRoute && userRol !== 'ADMIN') {
    const redirectUrl = '/inicio';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (
    isVendedorRoute &&
    userRol !== 'VENDEDOR' &&
    userRol !== 'RECLUTADOR'
  ) {
    const redirectUrl = '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
