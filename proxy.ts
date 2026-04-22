// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Si debe cambiar contraseña y no está en esa página → redirigir
    if (
      token?.mustChangePassword &&
      pathname !== '/change-password'
    ) {
      return NextResponse.redirect(new URL('/change-password', req.url))
    }

    // Protección por rol
    if (pathname.startsWith('/dashboard/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/dashboard/portero') && token?.role !== 'PORTERO') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (
      pathname.startsWith('/dashboard/copropietario') &&
      token?.role !== 'COPROPIETARIO'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // si no hay token → login
    },
  }
)

// Rutas que protege el middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/change-password',
  ],
}