// src/app/lib/PermissionsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PermissionGroup { id: number; title: string }
interface PermissionsContextType {
  permissionGroups: PermissionGroup[];
  hasPermission: (title: string) => boolean;
  setPermissionGroups: (g: PermissionGroup[]) => void;
}

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    // Prefer cookie (reliable on live)
    let cookieValue = getCookie('perm');
    if (!cookieValue) {
      cookieValue = getCookie('permissionGroups');
    }
    if (cookieValue) {
      try {
        let parsed: any = JSON.parse(cookieValue);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        if (Array.isArray(parsed)) {
          // If titles only, convert to objects
          const groups = parsed.map((title: string) => ({ id: 0, title }));
          setPermissionGroups(groups);
        }
      } catch (e) {
        console.error('Failed to parse permission cookie', e);
      }
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem('permissionGroups');
      if (stored) {
        try {
          let parsed: any = JSON.parse(stored);
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
          if (Array.isArray(parsed)) {
            setPermissionGroups(parsed);
          }
        } catch (e) {
          console.error('Failed to parse permissionGroups localStorage', e);
        }
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