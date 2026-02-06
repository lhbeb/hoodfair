import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Import shouldBypassAuth dynamically to avoid issues
  const { shouldBypassAuth } = await import('@/lib/supabase/auth');
  const bypassAuth = shouldBypassAuth();

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Bypass authentication in development if enabled
    if (bypassAuth) {
      console.log('🔓 [MIDDLEWARE] Bypassing authentication for:', pathname);
      const response = NextResponse.next();
      response.headers.set('x-pathname', pathname);
      return response;
    }

    const token = request.cookies.get('admin_token')?.value;
    const refreshToken = request.cookies.get('admin_refresh_token')?.value;

    if (!token) {
      // Check if we have a refresh token - if so, let the page handle the refresh
      // This prevents race condition issues during login
      if (refreshToken) {
        console.log('🔄 [MIDDLEWARE] No access token but refresh token exists, allowing through for client-side refresh');
        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        response.headers.set('x-needs-refresh', 'true');
        return response;
      }

      // No tokens at all, redirect to login
      console.log('🚫 [MIDDLEWARE] No tokens found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        // Token might be expired, check if we have refresh token
        if (refreshToken) {
          console.log('🔄 [MIDDLEWARE] Access token invalid but refresh token exists, allowing through for client-side refresh');
          const response = NextResponse.next();
          response.headers.set('x-pathname', pathname);
          response.headers.set('x-needs-refresh', 'true');
          return response;
        }

        // Invalid token and no refresh token, redirect to login
        console.log('🚫 [MIDDLEWARE] Invalid token and no refresh token, redirecting to login');
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_token');
        response.cookies.delete('admin_refresh_token');
        response.cookies.delete('admin_token_expires');
        return response;
      }

      // Check if user is admin
      const adminStatus = await isAdmin(user.email || '');
      if (!adminStatus) {
        // Not an admin, redirect to login
        console.log('🚫 [MIDDLEWARE] User is not admin, redirecting to login');
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_token');
        response.cookies.delete('admin_refresh_token');
        response.cookies.delete('admin_token_expires');
        return response;
      }

      // Authenticated admin, allow access
      const response = NextResponse.next();
      response.headers.set('x-pathname', pathname);
      return response;
    } catch (error) {
      console.error('❌ [MIDDLEWARE] Error verifying token:', error);

      // On error, check if we have refresh token before redirecting
      if (refreshToken) {
        console.log('🔄 [MIDDLEWARE] Error but refresh token exists, allowing through');
        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        response.headers.set('x-needs-refresh', 'true');
        return response;
      }

      // Error verifying token and no refresh, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      response.cookies.delete('admin_refresh_token');
      response.cookies.delete('admin_token_expires');
      return response;
    }
  }

  // For non-admin routes, just add pathname header
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

