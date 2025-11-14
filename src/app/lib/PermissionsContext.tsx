// src/app/lib/PermissionsContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname(); // ← Add this

  useEffect(() => {
    const permCookie = getCookie('perm');
    let updated = false;

    if (permCookie) {
      try {
        const titles = JSON.parse(permCookie);
        if (Array.isArray(titles)) {
          const groups = titles.map((title: string) => ({ id: 0, title }));
          setPermissionGroups(groups);
          updated = true;
        }
      } catch (e) {
        console.error("Failed to parse perm cookie");
      }
    }

    // Only fallback to localStorage if cookie failed
    if (!updated) {
      const stored = localStorage.getItem('permissionGroups');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPermissionGroups(parsed);
          }
        } catch {}
      }
    }
  }, [pathname]); // ← Re-run when route changes (critical!)

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