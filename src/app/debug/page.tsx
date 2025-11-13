// src/app/debug/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Debug() {
  const [cookies, setCookies] = useState<Record<string, string>>({});

  useEffect(() => {
    const cookieObj: Record<string, string> = {};
    document.cookie.split('; ').forEach(c => {
      const [k, ...v] = c.split('=');
      cookieObj[k.trim()] = decodeURIComponent(v.join('='));
    });
    setCookies(cookieObj);
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-4">Debug: Cookies</h1>
      <pre className="bg-white p-6 rounded-lg shadow text-sm overflow-auto border border-gray-200 text-black font-mono">
        {JSON.stringify(cookies, null, 2)}
      </pre>
      <p className="mt-4 text-gray-700">
        If you see <code className="bg-gray-200 text-black px-1 rounded">authToken</code> and <code className="bg-gray-200 text-black px-1 rounded">permissionGroups</code> → cookies are set correctly.
      </p>
    </div>
  );
}