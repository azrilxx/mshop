import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')

  // Debug: Log domain information
  console.log(`[Middleware] Host: ${host}, Path: ${pathname}`)
  
  // Handle custom domain routing
  if (host === 'shop.muvonenergy.com') {
    console.log(`[Middleware] Custom domain detected: ${host}`)
    // Custom domain should route to shop by default
    if (pathname === '/') {
      console.log(`[Middleware] Redirecting to /shop for custom domain`)
      return NextResponse.rewrite(new URL('/shop', request.url))
    }
  }

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/register', '/products', '/shop', '/api/auth/login', '/api/auth/register', '/api/products', '/api/comments']
  
  if (publicRoutes.includes(pathname) || pathname.startsWith('/product/')) {
    return NextResponse.next()
  }

  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const user = session.user

    // Role-based route protection
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/seller') && user.role !== 'seller') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}