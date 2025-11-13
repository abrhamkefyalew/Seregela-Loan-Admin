// src/app/lib/auth.client.ts
export const hasPermission = (required: string | string[]): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('userPermissions');
  if (!stored) return false;

  const userPermissions: string[] = JSON.parse(stored);
  const requiredArray = Array.isArray(required) ? required : [required];
  return requiredArray.some(perm => userPermissions.includes(perm));
};