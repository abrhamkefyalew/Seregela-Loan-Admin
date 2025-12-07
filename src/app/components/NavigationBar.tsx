// src/app/components/NavigationBar.tsx
'use client';

import { useRouter } from "next/navigation";
import { usePermissions } from "@/app/lib/PermissionsContext";

interface NavigationBarProps {
  navLoading: { [key: string]: boolean };
  setNavLoading: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  currentRoute: string;
  routeMap: { [key: string]: string };
}

interface NavItem {
  key: string;
  label: string;
  route: string;
  requiredPermission: string;
}

export default function NavigationBar({
  navLoading,
  setNavLoading,
  currentRoute,
}: NavigationBarProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  // const navItems: NavItem[] = [
  //   { key: "loans", label: "Loans", route: "/", requiredPermission: "Order Management" },
  //   { key: "loan_users", label: "Loan Users", route: "/loan_users", requiredPermission: "Order Management" },
  //   { key: "products", label: "Products", route: "/products", requiredPermission: "Product Management" },
  //   { key: "users", label: "Users", route: "/users", requiredPermission: "Customer Management" },
  //   { key: "overdue_loans", label: "Overdue Loans", route: "/overdue_loans", requiredPermission: "Order Management" },
  //   { key: "reports", label: "Reports", route: "/reports/excel", requiredPermission: "Report Management" },
  //   { key: "paid_loan_transactions", label: "Loan Transactions [Paid]", route: "/loanTransactions", requiredPermission: "Order Management" },
  //   { key: "completed_loans", label: "Loans [PAYMENT COMPLETED]", route: "/completedLoans", requiredPermission: "Order Management" },
  // ];
  //
  //
  const navItems: NavItem[] = [
    { key: "loans", label: "Loans", route: "/", requiredPermission: "Loan Management" },
    { key: "loan_users", label: "Loan Users", route: "/loan_users", requiredPermission: "Loan Management" },
    { key: "products", label: "Products", route: "/products", requiredPermission: "Loan Management" },
    { key: "users", label: "Users", route: "/users", requiredPermission: "Loan Management" },
    { key: "overdue_loans", label: "Overdue Loans", route: "/overdue_loans", requiredPermission: "Loan Management" },
    { key: "reports", label: "Reports", route: "/reports/excel", requiredPermission: "Finance Management" },
    { key: "paid_loan_transactions", label: "Loan Transactions [Paid]", route: "/loanTransactions", requiredPermission: "Finance Management" },
    { key: "completed_loans", label: "Loans [PAYMENT COMPLETED]", route: "/completedLoans", requiredPermission: "Finance Management" },
  ];

  const handleNavClick = (route: string, key: string) => {
    if (currentRoute === key || navLoading[key]) return;
    setNavLoading(prev => ({ ...prev, [key]: true }));
    router.push(route);
  };

  return (
    <>
      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          border: 3px solid rgba(255,255,255,.3);
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <nav className="bg-blue-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Seregela Gebeya</h1>

          <div className="flex space-x-4">
            {navItems
              .filter(i => hasPermission(i.requiredPermission))
              .map(({ key, label, route }) => {
                const active = currentRoute === key;
                const loading = navLoading[key];

                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(route, key)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-blue-600" : "bg-blue-800 hover:bg-blue-700"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading ? (
                      <>
                        <span className="spinner mr-2" />
                        {label}
                      </>
                    ) : (
                      label
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </nav>
    </>
  );
}