// src/app/lib/RequirePermission.tsx
'use client';

import { usePermissions } from './PermissionsContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RequirePermissionProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

export default function RequirePermission({
  children,
  requiredPermission,
  fallback = <div className="p-8 text-center">Loading permissions...</div>,
}: RequirePermissionProps) {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission(requiredPermission)) {
      router.replace('/unauthorized');
    }
  }, [hasPermission, requiredPermission, router]);

  if (!hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}