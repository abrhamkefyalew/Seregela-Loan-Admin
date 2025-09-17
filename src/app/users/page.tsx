'use client';

import { useState, useEffect } from 'react';
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
  const [loanApplying, setLoanApplying] = useState<{ [key: number]: boolean }>({});
  const [loanApplyError, setLoanApplyError] = useState<{ [key: number]: string | null }>({});
  const [loanApplySuccess, setLoanApplySuccess] = useState<{ [key: number]: string | null }>({});

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

  const handleApplyLoan = async (userId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setLoanApplying((prev) => ({ ...prev, [userId]: true }));
    setLoanApplyError((prev) => ({ ...prev, [userId]: null }));
    setLoanApplySuccess((prev) => ({ ...prev, [userId]: null }));

    try {
      const formData = new FormData();
      formData.append('user_id', userId.toString());

      const res = await fetch('https://api.seregelagebeya.com/api/v1/loans', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || 'Failed to apply for loan';
        console.warn('Loan application failed for user', userId, res.status, errorData);
        setLoanApplyError((prev) => ({ ...prev, [userId]: errorMessage }));
        return;
      }

      const json = await res.json();
      const newLoan = json.data;

      // Optimistically update the user's loans
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, loans: [...user.loans, newLoan] } : user
        )
      );
      setLoanApplySuccess((prev) => ({ ...prev, [userId]: 'Loan applied successfully!' }));

      // Clear success message after 5 seconds
      setTimeout(() => {
        setLoanApplySuccess((prev) => ({ ...prev, [userId]: null }));
      }, 5000);
    } catch (e) {
      console.warn('Error applying for loan for user', userId, e);
      setLoanApplyError((prev) => ({ ...prev, [userId]: 'Error applying for loan' }));
    } finally {
      setLoanApplying((prev) => ({ ...prev, [userId]: false }));
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
    setLoanApplyError({});
    setLoanApplySuccess({});
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
    if (expandedUserId !== userId) {
      setExpandedUserId(userId); // Expand if not already expanded
    }
  };

  const handleCollapse = (userId: number) => {
    setExpandedUserId(null); // Collapse when button is clicked
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
        .table-container {
          overflow-x: auto;
          width: 100%;
        }
        .table-container table {
          width: 100%;
          border-collapse: collapse;
        }
        .table-container th,
        .table-container td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        .table-container th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #1e40af;
        }
        .table-container td {
          color: #1e40af;
        }
        .loan-transaction th,
        .loan-transaction td {
          color: #15803d;
        }
        .loan-transaction th {
          background-color: #dcfce7;
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

      {/* Filter and Refresh Section */}
      <div className="mb-6 mx-4 sm:mx-6">
        <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-blue-900">Filter Users</h2>
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
                'Refresh'
              )}
            </button>
          </div>
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
                  className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer mb-4"
                    onClick={() => toggleUserExpand(user.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (expandedUserId === user.id) {
                            handleCollapse(user.id);
                          } else {
                            toggleUserExpand(user.id);
                          }
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        {expandedUserId === user.id ? 'Collapse' : 'Expand'}
                      </button>
                      <div>
                        <p className="text-lg font-bold text-blue-900">{user.phone_number}</p>
                        <p className="text-lg font-bold text-blue-900">{user.name}</p>
                        <p className="text-sm text-blue-600">ID: {user.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyLoan(user.id);
                      }}
                      disabled={loanApplying[user.id]}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        loanApplying[user.id]
                          ? 'bg-blue-900 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loanApplying[user.id] ? (
                        <>
                          <span className="spinner mr-2" />
                          Applying...
                        </>
                      ) : (
                        'Apply for Loan'
                      )}
                    </button>
                  </div>
                  {loanApplyError[user.id] && (
                    <p className="text-sm text-red-600 mb-4">{loanApplyError[user.id]}</p>
                  )}
                  {loanApplySuccess[user.id] && (
                    <p className="text-sm text-green-600 mb-4">{loanApplySuccess[user.id]}</p>
                  )}
                  {/* User Details Table */}
                  <div className="table-container mb-4">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>User Name</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Phone Number</th>
                          <th>Email Verified At</th>
                          <th>Is Active</th>
                          <th>Is Pin Updated</th>
                          <th>Is Corporate Manager</th>
                          <th>Is System User</th>
                          <th>Corporate ID</th>
                          <th>Bypass Quantity Restriction</th>
                          <th>Special Discount</th>
                          <th>Wallet Balance</th>
                          <th>Created At</th>
                          <th>Updated At</th>
                          <th>Deleted At</th>
                          <th>Address</th>
                          <th>Profile Image</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.user_name || 'N/A'}</td>
                          <td>{user.first_name}</td>
                          <td>{user.last_name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone_number}</td>
                          <td>{user.email_verified_at || 'N/A'}</td>
                          <td>{user.is_active ? 'Yes' : 'No'}</td>
                          <td>{user.is_pin_updated ? 'Yes' : 'No'}</td>
                          <td>{user.is_corporate_manager ? 'Yes' : 'No'}</td>
                          <td>{user.is_system_user ? 'Yes' : 'No'}</td>
                          <td>{user.corporate_id || 'N/A'}</td>
                          <td>{user.bypass_product_quantity_restriction ? 'Yes' : 'No'}</td>
                          <td>{user.special_discount ? 'Yes' : 'No'}</td>
                          <td>{user.wallet_balance} ETB</td>
                          <td>{new Date(user.created_at).toLocaleString()}</td>
                          <td>{new Date(user.updated_at).toLocaleString()}</td>
                          <td>{user.deleted_at || 'N/A'}</td>
                          <td>
                            {user.address
                              ? `${user.address.neighborhood}, ${user.address.house_number}${
                                  user.address.city ? `, ${user.address.city}` : ''
                                }${user.address.sub_city ? `, ${user.address.sub_city}` : ''}${
                                  user.address.woreda ? `, ${user.address.woreda}` : ''
                                }`
                              : 'N/A'}
                          </td>
                          <td>
                            {user.profile_image_path ? (
                              <img
                                src={user.profile_image_path}
                                alt="Profile"
                                className="w-12 h-12 object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.png';
                                }}
                              />
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
                        <div className="mb-6 bg-blue-50 p-4 rounded-md">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Fayda Customers</h4>
                          {user.fayda_customers.length === 0 ? (
                            <p className="text-sm text-blue-600">No fayda customers found.</p>
                          ) : (
                            <div className="table-container">
                              <table>
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Sub</th>
                                    <th>Phone Number</th>
                                    <th>Birthdate</th>
                                    <th>Residence Status</th>
                                    <th>Gender</th>
                                    <th>Address</th>
                                    <th>Nationality</th>
                                    <th>Is Verified</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Deleted At</th>
                                    <th>Picture</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {user.fayda_customers.map((fayda) => (
                                    <tr key={fayda.id}>
                                      <td>{fayda.id}</td>
                                      <td>{fayda.name}</td>
                                      <td>{fayda.email || 'N/A'}</td>
                                      <td>{fayda.sub}</td>
                                      <td>{fayda.phone_number}</td>
                                      <td>{fayda.birthdate}</td>
                                      <td>{fayda.residence_status || 'N/A'}</td>
                                      <td>{fayda.gender}</td>
                                      <td>
                                        {fayda.address
                                          ? `${fayda.address.region}, ${fayda.address.zone}, ${fayda.address.woreda}`
                                          : 'N/A'}
                                      </td>
                                      <td>{fayda.nationality || 'N/A'}</td>
                                      <td>{fayda.is_verified ? 'Yes' : 'No'}</td>
                                      <td>{new Date(fayda.created_at).toLocaleString()}</td>
                                      <td>{new Date(fayda.updated_at).toLocaleString()}</td>
                                      <td>{fayda.deleted_at || 'N/A'}</td>
                                      <td>
                                        {fayda.picture_path ? (
                                          <img
                                            src={fayda.picture_path}
                                            alt={fayda.name}
                                            className="w-16 h-16 object-cover rounded-md"
                                            onError={(e) => {
                                              e.currentTarget.src = '/placeholder.png';
                                            }}
                                          />
                                        ) : (
                                          'N/A'
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Loan User */}
                        <div className="mb-6 bg-blue-100 p-4 rounded-md border border-blue-200">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Loan User</h4>
                          {user.loan_user ? (
                            <div className="table-container">
                              <table>
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Loan Balance</th>
                                    <th>Loan Cap</th>
                                    <th>Is Approved</th>
                                    <th>Approved Date</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Deleted At</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>{user.loan_user.id}</td>
                                    <td>{user.loan_user.user_id}</td>
                                    <td>{user.loan_user.loan_balance} ETB</td>
                                    <td>{user.loan_user.loan_cap} ETB</td>
                                    <td>{user.loan_user.is_approved ? 'Yes' : 'No'}</td>
                                    <td>{user.loan_user.approved_date || 'N/A'}</td>
                                    <td>{new Date(user.loan_user.created_at).toLocaleString()}</td>
                                    <td>{new Date(user.loan_user.updated_at).toLocaleString()}</td>
                                    <td>{user.loan_user.deleted_at || 'N/A'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-blue-600">No loan user data found.</p>
                          )}
                        </div>

                        {/* Loans */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Loans</h4>
                          {user.loans.length === 0 ? (
                            <p className="text-sm text-blue-600">No loans found.</p>
                          ) : (
                            user.loans.map((loan) => (
                              <div
                                key={loan.id}
                                className="ml-4 mt-2 bg-blue-200 p-3 rounded-md border-l-4 border-blue-400"
                              >
                                <div className="table-container">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>ID</th>
                                        <th>Loan Code</th>
                                        <th>User ID</th>
                                        <th>Loan Amount</th>
                                        <th>Loan Cap</th>
                                        <th>Is Approved</th>
                                        <th>Is All Amount Spent</th>
                                        <th>Status</th>
                                        <th>Payment Completed At</th>
                                        <th>Repayment Rule</th>
                                        <th>Description</th>
                                        <th>Penalty ID</th>
                                        <th>Created At</th>
                                        <th>Updated At</th>
                                        <th>Deleted At</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>{loan.id}</td>
                                        <td>{loan.loan_code || 'N/A'}</td>
                                        <td>{loan.user_id}</td>
                                        <td>{loan.loan_amount} ETB</td>
                                        <td>{loan.loan_cap || 'N/A'}</td>
                                        <td>{loan.is_approved ? 'Yes' : 'No'}</td>
                                        <td>{loan.is_all_amount_spent ? 'Yes' : 'No'}</td>
                                        <td>{loan.status}</td>
                                        <td>{loan.payment_completed_at_date || 'N/A'}</td>
                                        <td>{loan.repayment_rule || 'N/A'}</td>
                                        <td>{loan.description || 'N/A'}</td>
                                        <td>{loan.penalty_id || 'N/A'}</td>
                                        <td>{new Date(loan.created_at).toLocaleString()}</td>
                                        <td>{new Date(loan.updated_at).toLocaleString()}</td>
                                        <td>{loan.deleted_at || 'N/A'}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                {/* Loan Transactions */}
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-green-800 mb-1">Loan Transactions</h5>
                                  {loan.loan_transactions.length === 0 ? (
                                    <p className="text-sm text-green-600">No transactions found.</p>
                                  ) : (
                                    <div className="table-container">
                                      <table className="loan-transaction">
                                        <thead>
                                          <tr>
                                            <th>ID</th>
                                            <th>Transaction Code</th>
                                            <th>Loan ID</th>
                                            <th>Order ID</th>
                                            <th>Amount</th>
                                            <th>Penalty</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Paid Date</th>
                                            <th>Due Date</th>
                                            <th>Payment Method</th>
                                            <th>Is Notified</th>
                                            <th>Penalty ID</th>
                                            <th>Request Payload</th>
                                            <th>Transaction ID Banks</th>
                                            <th>Response Payload</th>
                                            <th>Bank Payment Logic</th>
                                            <th>Bank Pay URL</th>
                                            <th>Created At</th>
                                            <th>Updated At</th>
                                            <th>Deleted At</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {loan.loan_transactions.map((transaction) => (
                                            <tr key={transaction.id}>
                                              <td>{transaction.id}</td>
                                              <td>{transaction.loan_transaction_code || 'N/A'}</td>
                                              <td>{transaction.loan_id}</td>
                                              <td>{transaction.order_id || 'N/A'}</td>
                                              <td>{transaction.amount} ETB</td>
                                              <td>{transaction.penalty} ETB</td>
                                              <td>{transaction.type}</td>
                                              <td>{transaction.status || 'N/A'}</td>
                                              <td>
                                                {transaction.paid_date
                                                  ? new Date(transaction.paid_date).toLocaleString()
                                                  : 'N/A'}
                                              </td>
                                              <td>
                                                {transaction.due_date
                                                  ? new Date(transaction.due_date).toLocaleString()
                                                  : 'N/A'}
                                              </td>
                                              <td>{transaction.payment_method || 'N/A'}</td>
                                              <td>{transaction.is_notified ? 'Yes' : 'No'}</td>
                                              <td>{transaction.penalty_id || 'N/A'}</td>
                                              <td>{transaction.request_payload || 'N/A'}</td>
                                              <td>{transaction.transaction_id_banks || 'N/A'}</td>
                                              <td>{transaction.response_payload || 'N/A'}</td>
                                              <td>{transaction.bank_payment_logic_data || 'N/A'}</td>
                                              <td>
                                                {transaction.bank_to_pay_url ? (
                                                  <a
                                                    href={transaction.bank_to_pay_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-500 hover:underline"
                                                  >
                                                    Pay
                                                  </a>
                                                ) : (
                                                  'N/A'
                                                )}
                                              </td>
                                              <td>{new Date(transaction.created_at).toLocaleString()}</td>
                                              <td>{new Date(transaction.updated_at).toLocaleString()}</td>
                                              <td>{transaction.deleted_at || 'N/A'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
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