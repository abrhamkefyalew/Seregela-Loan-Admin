'use client';

import { useRouter } from 'next/navigation';

interface NavigationBarProps {
  navLoading: { [key: string]: boolean };
  setNavLoading: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  currentRoute: string;
  routeMap: { [key: string]: string };
}

export default function NavigationBar({ navLoading, setNavLoading, currentRoute, routeMap }: NavigationBarProps) {
  const router = useRouter();

  const handleNavClick = (route: string, key: string) => {
    if (currentRoute === key || navLoading[key]) return;
    setNavLoading((prev) => ({ ...prev, [key]: true }));
    router.push(route);
  };

  // Ensure spinner CSS is included
  return (
    <>
      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <nav className="bg-blue-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Seregela Gebeya</h1>
          <div className="flex space-x-4">
            {[
              { key: 'loans', label: 'Loans', route: '/' },
              { key: 'loan_users', label: 'Loan Users', route: '/loan_users' },
              { key: 'products', label: 'Products', route: '/products' },
              { key: 'users', label: 'Users', route: '/users' },
            ].map(({ key, label, route }) => (
              <button
                key={key}
                onClick={() => handleNavClick(route, key)}
                disabled={navLoading[key]}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentRoute === key ? 'bg-blue-600' : 'bg-blue-800 hover:bg-blue-700'
                } ${navLoading[key] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {navLoading[key] ? (
                  <>
                    <span className="spinner mr-2" />
                    {label}
                  </>
                ) : (
                  label
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}