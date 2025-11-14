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
        // 1. Save everything
        localStorage.setItem("authToken", data.access_token);
        if (data.data) localStorage.setItem("user", JSON.stringify(data.data));

        if (Array.isArray(data.permission_groups)) {
          const groups = data.permission_groups;
          setPermissionGroups(groups);
          localStorage.setItem('permissionGroups', JSON.stringify(groups));

          // 2. SET COOKIE BEFORE REDIRECT (CRITICAL)
          const titlesOnly = groups.map((g: any) => g.title);
          const isProd = process.env.NODE_ENV === "production";
          const opts = `path=/; max-age=86400; SameSite=Lax${isProd ? "; Secure" : ""}`;
          
          document.cookie = `authToken=${data.access_token}; ${opts}`;
          document.cookie = `perm=${JSON.stringify(titlesOnly)}; ${opts}`;
        }

        // 3. NOW REDIRECT — cookie is already set
        router.push("/");
        router.refresh(); // Force reload to read new cookie
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

  // ... your JSX (unchanged)
}