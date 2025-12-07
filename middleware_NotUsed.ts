// middleware.ts (PROJECT ROOT)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES: Record<string, string> = {
  '/users': 'Customer Management',
  '/products': 'Product Management',
  '/reports': 'Report Management',
  '/loan_users': 'Order Management',
  '/overdue_loans': 'Order Management',
  '/loanTransactions': 'Order Management',
  '/completedLoans': 'Order Management',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;
  const permCookie = request.cookies.get('permissionGroups')?.value;

  // Allow public
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/unauthorized')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const required = PROTECTED_ROUTES[cleanPath];
  if (!required) return NextResponse.next();

  let hasPermission = false;
  if (permCookie) {
    try {
      const list = JSON.parse(permCookie);
      hasPermission = Array.isArray(list) && list.some((p: any) => p.title === required);
    } catch (e) {
      console.error('Invalid cookie:', e);
    }
  }

  if (!hasPermission) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};