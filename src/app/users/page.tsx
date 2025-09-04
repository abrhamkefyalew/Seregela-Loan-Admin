'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from '../components/NavigationBar';

interface Address {
  city: string | null;
  sub_city: string | null;
  woreda: string | null;
  neighborhood: string;
  house_number: string;
  longitude: string | null;
  latitude: string | null;
}

interface FaydaCustomer {
  id: number;
  user_id: number;
  name: string;
  email: string | null;
  sub: string;
  picture: string | null;
  picture_path: string;
  phone_number: string;
  birthdate: string;
  residence_status: string | null;
  gender: string;
  address: {
    zone: string;
    region: string;
    woreda: string;
  };
  nationality: string | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface LoanTransaction {
  id: number;
  loan_transaction_code: string | null;
  loan_id: number;
  order_id: number | null;
  amount: string;
  penalty: string;
  type: string;
  status: string | null;
  paid_date: string | null;
  due_date: string | null;
  payment_method: string | null;
  is_notified: number;
  penalty_id: number | null;
  request_payload: string | null;
  transaction_id_banks: string | null;
  response_payload: string | null;
  bank_payment_logic_data: string | null;
  bank_to_pay_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Loan {
  id: number;
  loan_code: string | null;
  user_id: number;
  loan_amount: string;
  loan_cap: string | null;
  is_approved: number;
  is_all_amount_spent: boolean | null;
  status: string;
  payment_completed_at_date: string | null;
  repayment_rule: string | null;
  description: string;
  penalty_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  loan_transactions: LoanTransaction[];
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
}

interface User {
  id: number;
  name: string;
  user_name: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  email_verified_at: string | null;
  is_active: number;
  is_pin_updated: boolean;
  is_corporate_manager: boolean;
  is_system_user: number;
  corporate_id: number | null;
  bypass_product_quantity_restriction: number;
  special_discount: boolean;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  fayda_customers: FaydaCustomer[];
  loan_user: LoanUser;
  loans: Loan[];
  profile_image_path: string | null;
  profile_thumbnail_path: string | null;
  address: Address;
}

interface UserMeta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

export default function Users() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
    users: false,
  });
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    phone_number: string;
  }>({
    phone_number: '',
  });

  // Map routes to nav items
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
    '/products': 'products',
    '/users': 'users',
  };
  const currentRoute = routeMap[pathname] || '';

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('per_page', '10');
    if (filters.phone_number) params.append('phone_number', filters.phone_number);
    return params.toString();
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams();
      const res = await fetch(`https://api.seregelagebeya.com/api/v1/users/index-users-for-loan?${queryParams}`, {
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
        console.warn('Users fetch failed:', res.status, errorBody);
        setError('Failed to load users');
        return;
      }

      const json = await res.json();
      setUsers(json.data);
      setUserMeta(json.meta);
    } catch (e) {
      console.warn('Error fetching users:', e);
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router, currentPage, filters.phone_number]);

  const handleNavClick = (route: string) => {
    if (routeMap[pathname] !== route) {
      setNavLoading((prev) => ({ ...prev, [route]: true }));
    }
  };

  const handleRefresh = () => {
    setError(null);
    setUsers([]);
    setUserMeta(null);
    setCurrentPage(1);
    setFilters({ phone_number: '' });
    fetchUsers();
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= (userMeta?.last_page || 1)) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const toggleUserExpand = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

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
      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <header className="mb-6 py-4 border-b border-blue-200 mx-4 sm:mx-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Users Dashboard</h1>
      </header>

      {/* Filter Section */}
      <div className="mb-6 mx-4 sm:mx-6">
        <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Filter Users</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={filters.phone_number}
                onChange={handleFilterChange}
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 251913780190"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  loading ? 'bg-blue-900 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <span className="spinner mr-2" />
                    Refreshing...
                  </>
                ) : (
                  'Clear Filters'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-blue-600 py-8 mx-4 sm:mx-6">Loading users...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8 mx-4 sm:mx-6">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center text-blue-600 py-4 mx-4 sm:mx-6">No users found.</div>
      ) : (
        <div className="w-full px-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4 rounded-lg shadow border border-blue-100 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleUserExpand(user.id)}
                  >
                    <div>
                      <h3 className="text-base font-semibold text-blue-900">{user.name}</h3>
                      <p className="text-sm text-blue-600">Phone: {user.phone_number}</p>
                      <p className="text-sm text-blue-600">Email: {user.email}</p>
                      <p className="text-sm text-blue-600">Wallet Balance: {user.wallet_balance} ETB</p>
                    </div>
                    <span className="text-blue-600">
                      {expandedUserId === user.id ? 'Collapse' : 'Expand'}
                    </span>
                  </div>
                  <AnimatePresence>
                    {expandedUserId === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 border-t border-blue-200 pt-4"
                      >
                        {/* Fayda Customers */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-blue-900">Fayda Customers</h4>
                          {user.fayda_customers.length === 0 ? (
                            <p className="text-sm text-blue-600">No fayda customers found.</p>
                          ) : (
                            user.fayda_customers.map((fayda) => (
                              <div key={fayda.id} className="ml-4 mt-2">
                                <p className="text-sm text-blue-600">Name: {fayda.name}</p>
                                <p className="text-sm text-blue-600">Phone: {fayda.phone_number}</p>
                                <p className="text-sm text-blue-600">Birthdate: {fayda.birthdate}</p>
                                <p className="text-sm text-blue-600">Gender: {fayda.gender}</p>
                                <p className="text-sm text-blue-600">
                                  Address: {fayda.address.region}, {fayda.address.zone}, {fayda.address.woreda}
                                </p>
                                {fayda.picture_path && (
                                  <img
                                    src={fayda.picture_path}
                                    alt={fayda.name}
                                    className="w-16 h-16 object-cover rounded-md mt-2"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.png';
                                    }}
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Loan User */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-blue-900">Loan User</h4>
                          {user.loan_user ? (
                            <div className="ml-4 mt-2">
                              <p className="text-sm text-blue-600">Loan Balance: {user.loan_user.loan_balance} ETB</p>
                              <p className="text-sm text-blue-600">Loan Cap: {user.loan_user.loan_cap} ETB</p>
                              <p className="text-sm text-blue-600">
                                Approved: {user.loan_user.is_approved ? 'Yes' : 'No'}
                              </p>
                              <p className="text-sm text-blue-600">
                                Created At: {new Date(user.loan_user.created_at).toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-blue-600">No loan user data found.</p>
                          )}
                        </div>

                        {/* Loans */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-blue-900">Loans</h4>
                          {user.loans.length === 0 ? (
                            <p className="text-sm text-blue-600">No loans found.</p>
                          ) : (
                            user.loans.map((loan) => (
                              <div key={loan.id} className="ml-4 mt-2 border-l border-blue-300 pl-4">
                                <p className="text-sm text-blue-600">Loan Amount: {loan.loan_amount} ETB</p>
                                <p className="text-sm text-blue-600">Status: {loan.status}</p>
                                <p className="text-sm text-blue-600">Description: {loan.description}</p>
                                <p className="text-sm text-blue-600">
                                  Created At: {new Date(loan.created_at).toLocaleString()}
                                </p>
                                {/* Loan Transactions */}
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-blue-800">Loan Transactions</h5>
                                  {loan.loan_transactions.length === 0 ? (
                                    <p className="text-sm text-blue-600">No transactions found.</p>
                                  ) : (
                                    loan.loan_transactions.map((transaction) => (
                                      <div key={transaction.id} className="ml-4 mt-2 border-l border-blue-200 pl-4">
                                        <p className="text-sm text-blue-600">Type: {transaction.type}</p>
                                        <p className="text-sm text-blue-600">Amount: {transaction.amount} ETB</p>
                                        <p className="text-sm text-blue-600">Status: {transaction.status || 'N/A'}</p>
                                        <p className="text-sm text-blue-600">
                                          Due Date:{' '}
                                          {transaction.due_date
                                            ? new Date(transaction.due_date).toLocaleString()
                                            : 'N/A'}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                          Payment Method: {transaction.payment_method || 'N/A'}
                                        </p>
                                        {transaction.bank_to_pay_url && (
                                          <a
                                            href={transaction.bank_to_pay_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:underline"
                                          >
                                            Payment URL
                                          </a>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {userMeta && (
            <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(1)}
                disabled={userMeta.current_page === 1}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(userMeta.current_page - 1)}
                disabled={userMeta.current_page === 1}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              {[...Array(userMeta.last_page).keys()]
                .filter((num) => Math.abs(num + 1 - userMeta.current_page) <= 2 || num === 0 || num === userMeta.last_page - 1)
                .map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => handlePageChange(num + 1)}
                    className={`px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors ${
                      num + 1 === userMeta.current_page ? 'bg-blue-600 text-white' : 'bg-blue-100'
                    }`}
                  >
                    {num + 1}
                  </button>
                ))}
              <button
                onClick={() => handlePageChange(userMeta.current_page + 1)}
                disabled={userMeta.current_page === userMeta.last_page}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(userMeta.last_page)}
                disabled={userMeta.current_page === userMeta.last_page}
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