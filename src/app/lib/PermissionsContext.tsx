// src/app/lib/PermissionsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PermissionGroup { id: number; title: string }

interface PermissionsContextType {
  permissionGroups: PermissionGroup[];
  hasPermission: (title: string) => boolean;
  setPermissionGroups: (g: PermissionGroup[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Helper: Read cookie
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    const cookieValue = getCookie('permissionGroups');
    if (cookieValue) {
      try {
        let parsed: any = JSON.parse(cookieValue);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed); // double-stringified fix
        }
        if (Array.isArray(parsed)) {
          setPermissionGroups(parsed);
        }
      } catch (e) {
        console.error('Failed to parse permissionGroups cookie', e);
      }
    }
  }, []);

  const hasPermission = (title: string) =>
    permissionGroups.some(g => g.title === title);

  return (
    <PermissionsContext.Provider value={{ permissionGroups, hasPermission, setPermissionGroups }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionsProvider");
  return ctx;
};