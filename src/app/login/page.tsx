// src/app/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: new FormData(document.getElementById('login-form') as HTMLFormElement)
      });

      const data = await response.json();

      if (response.ok && data?.access_token) {
        localStorage.setItem('authToken', data.access_token);
        router.push('/');
      } else {
        setError(data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        id="login-form"
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 font-bold text-black">Login to Dashboard</h2>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <div className="mb-4">
          <label className="block mb-1 font-medium text-black">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-black"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium text-black">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
