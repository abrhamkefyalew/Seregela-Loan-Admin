'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

interface NavigationBarProps {
  navLoading: { [key: string]: boolean };
  setNavLoading: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  currentRoute: string;
  routeMap: { [key: string]: string };
}

export default function NavigationBar({ navLoading, setNavLoading, currentRoute, routeMap }: NavigationBarProps) {
  const handleNavClick = (route: string) => {
    if (routeMap[usePathname()] !== route) {
      setNavLoading((prev) => ({ ...prev, [route]: true }));
    }
  };

  return (
    <>
      {/* Spinner CSS */}
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

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-6 mx-4 sm:mx-6">
        <ul className="flex space-x-4 sm:space-x-6 justify-center items-center">
          <li>
            <Link
              href="/"
              onClick={() => handleNavClick('loans')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.loans
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'loans'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'loans' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.loans && currentRoute !== 'loans' ? (
                <>
                  <span className="spinner mr-2" />
                  Loans
                </>
              ) : (
                'Loans'
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/loan_users"
              onClick={() => handleNavClick('loan_users')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.loan_users
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'loan_users'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'loan_users' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.loan_users && currentRoute !== 'loan_users' ? (
                <>
                  <span className="spinner mr-2" />
                  Loan Users
                </>
              ) : (
                'Loan Users'
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              onClick={() => handleNavClick('products')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.products
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'products'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'products' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.products && currentRoute !== 'products' ? (
                <>
                  <span className="spinner mr-2" />
                  Products
                </>
              ) : (
                'Products'
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}