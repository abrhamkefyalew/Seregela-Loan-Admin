// // src/app/unauthorized/page.tsx
// export default function Unauthorized() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
//         <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
//         <p className="text-gray-700 mb-4">
//           You do not have permission to view this page.
//         </p>
//         <a
//           href="/"
//           className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//         >
//           Go Home
//         </a>
//       </div>
//     </div>
//   );
// }




// src/app/unauthorized/page.tsx
// export default function Unauthorized() {
//   return (
//     <div style={{ padding: '2rem', textAlign: 'center' }}>
//       <h1>Access Denied</h1>
//       <p>You do not have permission to view this page.</p>
//       <a href="/">Go Home</a>
//     </div>
//   );
// }





// // src/app/unauthorized/page.tsx
// export default function Unauthorized() {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "linear-gradient(to bottom right, #6366f1, #8b5cf6)",
//         color: "white",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         textAlign: "center",
//         padding: "2rem",
//         fontFamily: "system-ui, sans-serif",
//       }}
//     >
//       <h1 style={{ fontSize: "4.5rem", fontWeight: "900", marginBottom: "1rem" }}>
//         Access Denied
//       </h1>

//       <p style={{ fontSize: "1.4rem", opacity: 0.9, marginBottom: "4rem" }}>
//         You don't have permission to view this page. Please log in again.
//       </p>

//       <a
//         href="/"
//         style={{
//           color: "rgba(255,255,255,0.8)",
//           textDecoration: "none",
//           fontSize: "1.1rem",
//           marginBottom: "2.5rem",
//         }}
//       >
//         ← Go back home
//       </a>

//       {/* Beautiful attractive button – pure inline styles only */}
//       <a
//         href="/login"
//         style={{
//           display: "inline-block",
//           padding: "18px 48px",
//           backgroundColor: "#ffffff",
//           color: "#6366f1",
//           fontSize: "1.25rem",
//           fontWeight: "bold",
//           borderRadius: "9999px",
//           textDecoration: "none",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//         }}
//       >
//         Re-login to Continue →
//       </a>
//     </div>
//   );
// }












// src/app/unauthorized/page.tsx
"use client";   // ← This is required only here, nowhere else

import { useState } from "react";

export default function Unauthorized() {
  const [clearing, setClearing] = useState(false);

  const handleForceReLogin = () => {
    setClearing(true);

    // 1. Clear all localStorage (authToken, user, permissionGroups, etc.)
    localStorage.clear();

    // 2. Delete ALL cookies (your authToken, perm, session cookies, everything)
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // 3. Full redirect to login — fresh start
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #6366f1, #8b5cf6)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        gap: "2.5rem",
      }}
    >
      <div>
        <h1 style={{ fontSize: "4.5rem", fontWeight: 900, margin: 0 }}>
          Access Denied
        </h1>
        <p style={{ fontSize: "1.4rem", opacity: 0.9, marginTop: "1rem" }}>
          Your session has expired or is no longer valid.<br />
          Please log in again.
        </p>
      </div>

      <a
        href="/"
        style={{
          color: "rgba(255,255,255,0.8)",
          textDecoration: "none",
          fontSize: "1.1rem",
        }}
      >
        ← Go back home
      </a>

      {/* Full logout + re-login button */}
      <button
        onClick={handleForceReLogin}
        disabled={clearing}
        style={{
          padding: "18px 56px",
          backgroundColor: "#ffffff",
          color: "#6366f1",
          fontSize: "1.3rem",
          fontWeight: "bold",
          borderRadius: "9999px",
          border: "none",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          cursor: clearing ? "not-allowed" : "pointer",
          opacity: clearing ? 0.85 : 1,
          transition: "all 0.3s ease",
          minWidth: "280px",
        }}
        onMouseOver={(e) => !clearing && (e.currentTarget.style.transform = "translateY(-5px)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {clearing ? "Clearing session..." : "Re-login to Continue →"}
      </button>
    </div>
  );
}