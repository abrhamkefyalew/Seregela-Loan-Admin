// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTokenServer } from './app/lib/auth.server_NotUsed';

const protectedRoutes: Record<string, string> = {
  '/': 'Dashboard',
  '/loan_users': 'Customer Management',
  '/products': 'Product Management',
  '/users': 'RBAC Management',
  '/overdue_loans': 'Report Management',
  '/reports/excel': 'Report Management',
  '/loanTransactions': 'Report Management',
  '/completedLoans': 'Report Management',
};

export async function middleware(req: NextRequest) {
  const token = await getTokenServer(); // AWAIT
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Optional: Validate permissions via API
  for (const [route, perm] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/user/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return NextResponse.redirect(new URL('/login', req.url));

      const data = await res.json();
      const groups = data.permission_groups?.map((g: any) => g.title) || [];
      if (!groups.includes(perm)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};