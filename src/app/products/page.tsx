'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  name_am: string;
  is_active: number;
  products_count: number;
  image_path: string | null;
  created_at: string;
  deleted_at: string | null;
}

export default function Products() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    users: false,
    products: false,
  });

  const fetchCategories = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://api.seregelagebeya.com/api/v1/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        console.warn('Unauthorized access, redirecting to login');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Categories fetch failed:', res.status, errorBody);
        setError('Failed to load categories');
        return;
      }

      const json = await res.json();
      setCategories(json.data);
    } catch (e) {
      console.warn('Error fetching categories:', e);
      setError('Error loading categories');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [router]);

  const handleCategoryClick = (categoryId: number) => {
    console.log(`Category clicked: ${categoryId}`);
  };

  const handleNavClick = (route: string) => {
    setNavLoading((prev) => ({ ...prev, [route]: true }));
  };

  const handleRefresh = () => {
    setError(null); // Clear any previous errors
    fetchCategories(); // Trigger data refresh
  };

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 p-4 sm:p-6">
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
      <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-6">
        <ul className="flex space-x-4 sm:space-x-6 justify-center items-center">
          <li>
            <Link
              href="/"
              onClick={() => handleNavClick('loans')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.loans
                  ? 'bg-blue-900 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
            >
              {navLoading.loans ? (
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
              href="/users"
              onClick={() => handleNavClick('users')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.users
                  ? 'bg-blue-900 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
            >
              {navLoading.users ? (
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
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900 underline'
              }`}
            >
              {navLoading.products ? (
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

      <header className="mb-6 py-4 border-b border-blue-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Products Dashboard</h1>
      </header>

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            loading
              ? 'bg-blue-900 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <span className="spinner mr-2" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-blue-600 py-8">Loading categories...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-blue-600 py-8">No categories found.</div>
      ) : (
        <div className="w-full flex flex-row space-x-4 overflow-x-auto snap-x snap-mandatory">
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white px-3 py-2 rounded-lg shadow border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors w-32 flex-shrink-0 snap-start"
                onClick={() => handleCategoryClick(category.id)}
              >
                <h2 className="text-base font-semibold text-blue-900 truncate">{category.name}</h2>
                <p className="text-xs text-blue-600">Products: {category.products_count}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <footer className="mt-10 pt-6 border-t border-blue-200 text-center text-sm text-blue-600">
        &copy; 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}