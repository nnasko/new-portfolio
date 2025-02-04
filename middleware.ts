import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Get auth token from cookies
  const authToken = request.cookies.get('invoice-auth')?.value;

  // Check if the path is invoice-related
  if (path.startsWith('/invoice')) {
    // Allow access to login page
    if (path === '/invoice/login') {
      // If already authenticated, redirect to invoice dashboard
      if (authToken) {
        return NextResponse.redirect(new URL('/invoice', request.url));
      }
      // Otherwise, allow access to login page
      return NextResponse.next();
    }

    // For all other invoice routes, check authentication
    if (!authToken) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/invoice/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/invoice/:path*',
}; 