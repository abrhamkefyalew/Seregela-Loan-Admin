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





// src/app/unauthorized/page.tsx
export default function Unauthorized() {
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
      }}
    >
      <h1 style={{ fontSize: "4.5rem", fontWeight: "900", marginBottom: "1rem" }}>
        Access Denied
      </h1>

      <p style={{ fontSize: "1.4rem", opacity: 0.9, marginBottom: "4rem" }}>
        You don't have permission to view this page. Please log in again.
      </p>

      <a
        href="/"
        style={{
          color: "rgba(255,255,255,0.8)",
          textDecoration: "none",
          fontSize: "1.1rem",
          marginBottom: "2.5rem",
        }}
      >
        ← Go back home
      </a>

      {/* Beautiful attractive button – pure inline styles only */}
      <a
        href="/login"
        style={{
          display: "inline-block",
          padding: "18px 48px",
          backgroundColor: "#ffffff",
          color: "#6366f1",
          fontSize: "1.25rem",
          fontWeight: "bold",
          borderRadius: "9999px",
          textDecoration: "none",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        Re-login to Continue →
      </a>
    </div>
  );
}