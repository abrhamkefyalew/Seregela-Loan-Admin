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

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('permissionGroups');
    if (stored) {
      try {
        // FIX: stored is a STRING like "[{...}]"
        let parsed: any = JSON.parse(stored);

        // FIX: If it's a string (double-parsed), parse again
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }

        if (Array.isArray(parsed)) {
          setPermissionGroups(parsed);
        }
      } catch (e) {
        console.error('Failed to parse permissionGroups', e);
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