// src/app/lib/useSetPermissions.ts
'use client';

import { useContext } from 'react';
import { PermissionsContext } from './PermissionsContext';

export function useSetPermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('useSetPermissions must be used within PermissionsProvider');
  }
  return context.setPermissionGroups;
}