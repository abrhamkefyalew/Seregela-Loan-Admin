// src/app/lib/PermissionsContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from "react";

interface PermissionGroup { id: number; title: string }
interface PermissionsContextType {
  permissionGroups: PermissionGroup[];
  hasPermission: (title: string) => boolean;
  setPermissionGroups: (g: PermissionGroup[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

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