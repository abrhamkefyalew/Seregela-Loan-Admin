// src/app/lib/auth.server.ts
import { headers } from 'next/headers';

export const getTokenServer = async (): Promise<string | null> => {
  try {
    const headerList = await headers(); // AWAIT HERE
    const authHeader = headerList.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
  } catch {
    return null;
  }
};