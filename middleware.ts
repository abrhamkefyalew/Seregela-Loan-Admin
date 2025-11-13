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

  // Debug: Log to server console (check terminal)
  console.log('Middleware:', { pathname, hasToken: !!token, permCookie });

  // Allow public routes
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/unauthorized') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // NO TOKEN → LOGIN
  if (!token) {
    console.log('No token → redirect to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Find exact match
  const requiredPermission = PROTECTED_ROUTES[pathname];
  if (!requiredPermission) {
    return NextResponse.next(); // not protected
  }

  // Parse permissions
  let permissions: string[] = [];
  if (permCookie) {
    try {
      const parsed = JSON.parse(permCookie);
      permissions = Array.isArray(parsed) ? parsed.map((p: any) => p.title) : [];
    } catch (e) {
      console.error('Failed to parse permissionGroups:', e);
    }
  }

  console.log('Required:', requiredPermission, 'Has:', permissions);

  // NO PERMISSION → UNAUTHORIZED
  if (!permissions.includes(requiredPermission)) {
    console.log('Access denied → /unauthorized');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/users',
    '/products',
    '/reports/:path*',
    '/loan_users',
    '/overdue_loans',
    '/loanTransactions',
    '/completedLoans',
  ],
};