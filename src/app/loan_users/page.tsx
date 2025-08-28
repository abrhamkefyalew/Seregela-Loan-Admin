'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

interface User {
  id: number;
  user_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  is_verified: number;
  email_verified_at: string | null;
  firebase_token: string | null;
  firebase_id: string | null;
  cbe_birr_plus_token: string | null;
  image: string | null;
  cover_photo: string | null;
  provider_id: string | null;
  provider: string | null;
  corporate_id: string | null;
  wallet_balance: number;
  bypass_product_quantity_restriction: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_active: number;
  is_system_user: number;
  userable_type: string | null;
  userable_id: string | null;
  last_active_at: string | null;
}

interface LoanUser {
  id: number;
  user_id: number;
  loan_balance: string;
  loan_cap: string;
  is_approved: number;
  approved_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: User;
}

interface Meta {
  current_page: number;
  from: number;
  to: number;
  total: number;
  last_page: number;
  path: string;
  per_page: number;
}

export default function LoanUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const [loanUsers, setLoanUsers] = useState<LoanUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: Set<string> }>({});
  const [paginateCount, setPaginateCount] = useState(10);
  const [userIdSearch, setUserIdSearch] = useState('');
  const [loanCapSearch, setLoanCapSearch] = useState('');
  const [isApprovedSearch, setIsApprovedSearch] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    users: false,
    products: false,
  });

  // Map routes to nav items
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'users',
    '/products': 'products',
  };
  const currentRoute = routeMap[pathname] || '';

  const fetchData = useCallback(async (page = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      let url = `https://api.seregelagebeya.com/api/v1/loan-users?page=${page}&per_page=${paginateCount}`;
      
      if (userIdSearch) {
        url += `&user_id_search=${encodeURIComponent(userIdSearch)}`;
      }
      
      if (loanCapSearch) {
        url += `&loan_cap_search=${encodeURIComponent(loanCapSearch)}`;
      }

      if (isApprovedSearch) {
        url += `&is_approved_search=${encodeURIComponent(isApprovedSearch)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        console.warn('Unauthorized access - redirecting to login:', { status: res.status });
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Loan users fetch failed:', res.status, errorBody);
        if (res.status !== 422) {
          router.push('/login');
        }
        setLoanUsers([]);
        setMeta(null);
        return;
      }

      const json = await res.json();
      setLoanUsers(json.data);
      setMeta(json.meta);
    } catch (e) {
      console.warn('Error fetching loan users:', e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [paginateCount, userIdSearch, loanCapSearch, isApprovedSearch, router]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }

    const handler = setTimeout(() => {
      setSearchTrigger(prev => prev + 1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [userIdSearch, loanCapSearch, isApprovedSearch, router]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }

    setCurrentPage(1);
    fetchData(1);
  }, [searchTrigger]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }

    fetchData(currentPage);
  }, [currentPage, paginateCount, fetchData]);

  const toggleSection = (loanUserId: number, section: string) => {
    setExpandedSections(prev => {
      const loanUserSections = new Set(prev[loanUserId] || []);
      if (loanUserSections.has(section)) {
        loanUserSections.delete(section);
      } else {
        loanUserSections.add(section);
      }
      return { ...prev, [loanUserId]: loanUserSections };
    });
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= (meta?.last_page || 1)) setCurrentPage(page);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger(prev => prev + 1);
  };

  const handleClearSearch = () => {
    setUserIdSearch('');
    setLoanCapSearch('');
    setIsApprovedSearch('');
    setSearchTrigger(prev => prev + 1);
  };

  const handleNavClick = (route: string) => {
    if (routeMap[pathname] !== route) {
      setNavLoading((prev) => ({ ...prev, [route]: true }));
    }
  };

  const handleRefresh = () => {
    setLoanUsers([]);
    setMeta(null);
    setUserIdSearch('');
    setLoanCapSearch('');
    setIsApprovedSearch('');
    setCurrentPage(1);
    fetchData(1);
  };

  const renderValue = (value: any) => (value === null || value === undefined ? 'N/A' : value);

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 p-0">
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
              onClick={() => handleNavClick('users')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.users
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'users'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'users' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.users && currentRoute !== 'users' ? (
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

      <header className="mb-6 py-4 border-b border-blue-200 mx-4 sm:mx-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Loan Users Dashboard</h1>
      </header>

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end mx-4 sm:mx-6">
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

      {/* Search Form */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-blue-100 mx-4 sm:mx-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">User ID</label>
            <input
              type="text"
              value={userIdSearch}
              onChange={(e) => setUserIdSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Loan Cap</label>
            <input
              type="text"
              value={loanCapSearch}
              onChange={(e) => setLoanCapSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter loan cap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Is Approved</label>
            <select
              value={isApprovedSearch}
              onChange={(e) => setIsApprovedSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="col-span-full flex justify-end space-x-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center mx-4 sm:mx-6">
        <div className="mb-4 sm:mb-0">
          <label className="mr-2 text-sm font-medium text-blue-700">Items per page:</label>
          <select
            className="bg-blue-50 border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={paginateCount}
            onChange={(e) => setPaginateCount(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        
        {meta && (
          <div className="text-sm text-blue-600">
            Showing {meta.from} to {meta.to} of {meta.total} results
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-blue-600 py-8 mx-4 sm:mx-6">Loading loan users...</div>
      ) : loanUsers.length === 0 ? (
        <div className="text-center text-blue-600 py-8 mx-4 sm:mx-6">
          No loan users found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-6 mx-4 sm:mx-6">
          {loanUsers.map((loanUser) => {
            const sections = expandedSections[loanUser.id] || new Set();
            return (
              <div key={loanUser.id} className="bg-white p-4 sm:p-6 rounded-lg shadow border border-blue-100">
                <div className="w-full min-w-0">
                  {/* Loan User Details Section (Always Visible) */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Loan User Details</h2>
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full align-middle">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm border border-blue-200 rounded-lg p-4">
                          <div>
                            <div className="font-semibold text-blue-700">Loan User ID</div>
                            <div>{renderValue(loanUser.id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">User ID</div>
                            <div>{renderValue(loanUser.user_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Loan Balance</div>
                            <div>{renderValue(loanUser.loan_balance)}</div>
                          </div>

                          <div>
                            <div className="font-semibold text-blue-700">Loan Cap</div>
                            <div>{renderValue(loanUser.loan_cap)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Is Approved</div>
                            <div>{loanUser.is_approved ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Approved Date</div>
                            <div>{renderValue(loanUser.approved_date)}</div>
                          </div>

                          <div>
                            <div className="font-semibold text-blue-700">Created At</div>
                            <div>{renderValue(new Date(loanUser.created_at).toLocaleString())}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Updated At</div>
                            <div>{renderValue(new Date(loanUser.updated_at).toLocaleString())}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Deleted At</div>
                            <div>{renderValue(loanUser.deleted_at)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Details Section (Collapsible) */}
                  <div className="mb-4">
                    <div 
                      className="text-sm text-blue-600 cursor-pointer hover:underline font-semibold mb-2"
                      onClick={() => toggleSection(loanUser.id, 'user')}
                    >
                      {sections.has('user') ? '▲ Hide User Details' : '▼ Show User Details'}
                    </div>
                    <AnimatePresence>
                      {sections.has('user') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm border border-blue-200 rounded-lg p-4">
                                <div>
                                  <div className="font-semibold text-blue-700">User ID</div>
                                  <div>{renderValue(loanUser.user.id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">User Name</div>
                                  <div>{renderValue(loanUser.user.user_name)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">First Name</div>
                                  <div>{renderValue(loanUser.user.first_name)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Last Name</div>
                                  <div>{renderValue(loanUser.user.last_name)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Email</div>
                                  <div>{renderValue(loanUser.user.email)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Phone Number</div>
                                  <div>{renderValue(loanUser.user.phone_number)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Is Verified</div>
                                  <div>{loanUser.user.is_verified ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Email Verified At</div>
                                  <div>{renderValue(loanUser.user.email_verified_at)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Firebase ID</div>
                                  <div>{renderValue(loanUser.user.firebase_id)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Wallet Balance</div>
                                  <div>{renderValue(loanUser.user.wallet_balance)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Bypass Quantity Restriction</div>
                                  <div>{loanUser.user.bypass_product_quantity_restriction ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">User Status</div>
                                  <div>{renderValue(loanUser.user.status)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Is Active</div>
                                  <div>{loanUser.user.is_active ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Is System User</div>
                                  <div>{loanUser.user.is_system_user ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Provider</div>
                                  <div>{renderValue(loanUser.user.provider)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Corporate ID</div>
                                  <div>{renderValue(loanUser.user.corporate_id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Provider ID</div>
                                  <div>{renderValue(loanUser.user.provider_id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Image</div>
                                  <div>{renderValue(loanUser.user.image)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Cover Photo</div>
                                  <div>{renderValue(loanUser.user.cover_photo)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Userable Type</div>
                                  <div>{renderValue(loanUser.user.userable_type)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Userable ID</div>
                                  <div>{renderValue(loanUser.user.userable_id)}</div>
                                </div>

                                <div>
                                  <div className="font-semibold text-blue-700">Last Active At</div>
                                  <div>{renderValue(loanUser.user.last_active_at)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Created At</div>
                                  <div>{renderValue(new Date(loanUser.user.created_at).toLocaleString())}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Updated At</div>
                                  <div>{renderValue(new Date(loanUser.user.updated_at).toLocaleString())}</div>
                                </div>

                                <div className="col-span-full">
                                  <div className="font-semibold text-blue-700">Deleted At</div>
                                  <div>{renderValue(loanUser.user.deleted_at)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Pagination */}
          {meta && (
            <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              {[...Array(meta.last_page).keys()].filter(num => Math.abs(num + 1 - currentPage) <= 2 || num === 0 || num === meta.last_page - 1).map((num) => (
                <button
                  key={num + 1}
                  onClick={() => handlePageChange(num + 1)}
                  className={`px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors ${
                    (num + 1) === currentPage ? 'bg-blue-600 text-white' : 'bg-blue-100'
                  }`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(meta.last_page)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                Last
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="mt-10 pt-6 border-t border-blue-200 text-center text-sm text-blue-600 mx-4 sm:mx-6">
        &copy; 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}