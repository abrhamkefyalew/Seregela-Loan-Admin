// src/app/login/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/app/lib/PermissionsContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setPermissionGroups } = usePermissions();

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
        // ---------- 1. CLIENT-SIDE (UI) ----------
        localStorage.setItem("authToken", data.access_token);
        if (data.data) localStorage.setItem("user", JSON.stringify(data.data));
        if (Array.isArray(data.permission_groups)) {
          setPermissionGroups(data.permission_groups);
          localStorage.setItem("permissionGroups", JSON.stringify(data.permission_groups));
        }

        // ---------- 2. SERVER-SIDE (MIDDLEWARE) ----------
        // 24-hour cookie, Secure only in production
        const isProd = process.env.NODE_ENV === "production";
        const maxAge = 60 * 60 * 24; // 24 h
        const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Strict${isProd ? "; Secure" : ""}`;

        document.cookie = `authToken=${data.access_token}; ${cookieOptions}`;
        document.cookie = `permissionGroups=${JSON.stringify(data.permission_groups || [])}; ${cookieOptions}`;

        router.push("/");
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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}