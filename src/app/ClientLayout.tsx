// src/app/ClientLayout.tsx
'use client';

import { PermissionsProvider } from "./lib/PermissionsContext";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <PermissionsProvider>{children}</PermissionsProvider>;
}