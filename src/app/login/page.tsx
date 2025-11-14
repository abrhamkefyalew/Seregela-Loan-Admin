// src/app/login/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetPermissions } from "@/app/lib/useSetPermissions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setPermissionGroups = useSetPermissions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = document.getElementById("login-form") as HTMLFormElement;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/login`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      const data = await res.json();

      if (res.ok && data?.access_token) {
        // Save to localStorage (for other parts of app)
        localStorage.setItem("authToken", data.access_token);
        if (data.data) localStorage.setItem("user", JSON.stringify(data.data));

        // Set permissions
        if (Array.isArray(data.permission_groups)) {
          const groups = data.permission_groups;
          setPermissionGroups(groups);
          localStorage.setItem('permissionGroups', JSON.stringify(groups));

          // CRITICAL: Set cookies with domain so Nginx passes them to backend
          const titlesOnly = groups.map((g: any) => g.title);
          const isProd = process.env.NODE_ENV === "production";
          
          // THIS LINE IS THE FIX — domain= makes cookie visible to your IP/domain
          const cookieOptions = `path=/; domain=${window.location.hostname}; max-age=86400; SameSite=Lax${isProd ? "; Secure" : ""}`;

          document.cookie = `authToken=${data.access_token}; ${cookieOptions}`;
          document.cookie = `perm=${JSON.stringify(titlesOnly)}; ${cookieOptions}`;
        }

        // Force Next.js to re-read cookies on next render
        router.push("/");
        router.refresh();

      } else {
        setError(data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        id="login-form"
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Loan Admin Dashboard
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
            placeholder="admin@example.com"
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>
      </form>
    </div>
  );
}