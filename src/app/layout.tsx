// // src/app/layout.tsx

// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Loan Management Dashboard",
//   description: "Loan Management Dashboard",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }







// // src/app/layout.tsx
// 'use client';

// import { useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { PermissionsProvider, usePermissions } from './lib/PermissionsContext';
// import { ReactNode } from 'react';
// import "./globals.css";

// const PROTECTED_ROUTES: Record<string, string> = {
//   '/users': 'Customer Management',
//   '/products': 'Product Management',
//   '/reports': 'Report Management',
//   '/loan_users': 'Order Management',
//   '/overdue_loans': 'Order Management',
//   '/loanTransactions': 'Order Management',
//   '/completedLoans': 'Order Management',
// };

// function RouteGuard({ children }: { children: ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { permissionGroups } = usePermissions();

//   useEffect(() => {
//     const cleanPath = pathname.endsWith('/') ?  pathname.slice(0, -1) : pathname;
//     const required = PROTECTED_ROUTES[cleanPath];

//     if (required) {
//       const hasPermission = permissionGroups.some(p => p.title === required);
//       if (!hasPermission) {
//         router.replace('/unauthorized');
//       }
//     }
//   }, [pathname, permissionGroups, router]);

//   return <>{children}</>;
// }

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <PermissionsProvider>
//           <RouteGuard>{children}</RouteGuard>
//         </PermissionsProvider>
//       </body>
//     </html>
//   );
// }




















// // src/app/layout.tsx
// 'use client';

// import { useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { PermissionsProvider, usePermissions } from './lib/PermissionsContext';
// import { ReactNode } from 'react';
// import "./globals.css";

// const PROTECTED_ROUTES: Record<string, string> = {
//   '/': 'Order Management',           // ← LOANS PAGE
//   '/users': 'Customer Management',
//   '/products': 'Product Management',
//   '/reports': 'Report Management',
//   '/loan_users': 'Order Management',
//   '/overdue_loans': 'Order Management',
//   '/loanTransactions': 'Order Management',
//   '/completedLoans': 'Order Management',
// };

// function RouteGuard({ children }: { children: ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { permissionGroups } = usePermissions();

//   useEffect(() => {
//     const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
//     const required = PROTECTED_ROUTES[cleanPath];

//     if (required) {
//       const hasPermission = permissionGroups.some(p => p.title === required);
//       if (!hasPermission) {
//         router.replace('/unauthorized');
//       }
//     }
//   }, [pathname, permissionGroups, router]);

//   return <>{children}</>;
// }

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <PermissionsProvider>
//           <RouteGuard>{children}</RouteGuard>
//         </PermissionsProvider>
//       </body>
//     </html>
//   );
// }














// src/app/layout.tsx
// src/app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PermissionsProvider, usePermissions } from './lib/PermissionsContext';
import { ReactNode } from 'react';
import "./globals.css";

const PROTECTED_ROUTES: Record<string, string> = {
  '/': 'Order Management',
  '/users': 'Customer Management',
  '/products': 'Product Management',
  '/reports': 'Report Management',
  '/loan_users': 'Order Management',
  '/overdue_loans': 'Order Management',
  '/loanTransactions': 'Order Management',
  '/completedLoans': 'Order Management',
};

function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { permissionGroups } = usePermissions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || permissionGroups.length === 0) return;

    const cleanPath = pathname.replace(/\/$/, '') || '/';
    const required = PROTECTED_ROUTES[cleanPath];
    if (required && !permissionGroups.some(p => p.title === required)) {
      router.replace('/unauthorized');
    }
  }, [mounted, pathname, permissionGroups, router]);

  // SAME ON SERVER & CLIENT — NO bg-gray-100!
  if (!mounted || permissionGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PermissionsProvider>
          <RouteGuard>{children}</RouteGuard>
        </PermissionsProvider>
      </body>
    </html>
  );
}