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
        localStorage.setItem("authToken", data.access_token);
        if (data.data) localStorage.setItem("user", JSON.stringify(data.data));
        if (Array.isArray(data.permission_groups)) {
          const groups = data.permission_groups;
          setPermissionGroups(groups);
          localStorage.setItem('permissionGroups', JSON.stringify(groups));
          const titlesOnly = groups.map((g: any) => g.title);
          // Removed ; Secure for HTTP compatibility (add back after setting up HTTPS)
          const cookieOptions = `path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `authToken=${data.access_token}; ${cookieOptions}`;
          document.cookie = `perm=${JSON.stringify(titlesOnly)}; ${cookieOptions}`;
        }
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
      <form id="login-form" onSubmit={handleLogin} className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Loan Admin</h2>
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}
        <input name="email" type="email" placeholder="Email" required className="w-full p-4 mb-4 border rounded-lg text-black" />
        <input name="password" type="password" placeholder="Password" required className="w-full p-4 mb-8 border rounded-lg text-black" />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}