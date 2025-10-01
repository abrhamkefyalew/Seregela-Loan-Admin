'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import NavigationBar from '../components/NavigationBar';

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

interface Address {
  city: string | null;
  sub_city: string | null;
  woreda: string | null;
  neighborhood: string | null;
  house_number: string | null;
  longitude: string | null;
  latitude: string | null;
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
  repayment_rule: string | { term_months: string } | null;
  description: string | null;
  penalty_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  loan_transactions: LoanTransaction[];
}

interface User {
  id: number;
  name: string;
  user_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
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
  loans: Loan[];
  profile_image_path: string | null;
  profile_thumbnail_path: string | null;
  address: Address;
}

export default function OverdueLoans() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: Set<string> }>({});
  const [paginateCount, setPaginateCount] = useState(10);
  const [userIdSearch, setUserIdSearch] = useState('');
  const [loanAmountSearch, setLoanAmountSearch] = useState('');
  const [phoneNumberSearch, setPhoneNumberSearch] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
    users: false,
    overdue_loans: false,
  });
  const [sendingSMS, setSendingSMS] = useState<{ [key: number]: boolean }>({});
  const [paying, setPaying] = useState<{ [key: number]: boolean }>({});

  // Map routes to nav items
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
    '/products': 'products',
    '/users': 'users',
    '/overdue_loans': 'overdue_loans',
  };
  const currentRoute = routeMap[pathname] || '';

  // Utility function to determine transaction row class
  const getTransactionClass = (transaction: LoanTransaction) => {
    console.log(`Transaction ID: ${transaction.id}, Type: ${transaction.type}, Status: ${transaction.status}, Paid Date: ${transaction.paid_date}`);
    if (transaction.type === 'LOAN_REPAYMENT') {
      if (transaction.status === 'NOT_PAID' && transaction.paid_date === null) {
        console.log(`Transaction ${transaction.id} is UNPAID (Red)`);
        return 'loan-transaction-unpaid';
      }
      console.log(`Transaction ${transaction.id} is PAID (Green)`);
      return 'loan-transaction-paid';
    }
    console.log(`Transaction ${transaction.id} is NORMAL (Default)`);
    return 'loan-transaction-normal';
  };

  // Updated renderValue to handle objects
  const renderValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && 'term_months' in value) {
      return `${value.term_months} month${Number(value.term_months) !== 1 ? 's' : ''}`;
    }
    return value;
  };

  const fetchData = useCallback(async (page = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      let url = `https://api.seregelagebeya.com/api/v1/loans/index-users-with-unpaid-loan-transactions-corrected-used?page=${page}&per_page=${paginateCount}`;
      
      if (userIdSearch) url += `&user_id_search=${encodeURIComponent(userIdSearch)}`;
      if (loanAmountSearch) url += `&loan_amount_search=${encodeURIComponent(loanAmountSearch)}`;
      if (phoneNumberSearch) url += `&phone_number_search=${encodeURIComponent(phoneNumberSearch)}`;

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
        console.warn('Overdue loans fetch failed:', res.status, errorBody);
        if (res.status !== 422) {
          router.push('/login');
        }
        setUsers([]);
        setMeta(null);
        return;
      }

      const json = await res.json();
      setUsers(json.data);
      setMeta(json.meta);
    } catch (e) {
      console.warn('Error fetching overdue loans:', e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [paginateCount, userIdSearch, loanAmountSearch, phoneNumberSearch, router]);

  const handleSendSMS = async (transactionId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setSendingSMS(prev => ({ ...prev, [transactionId]: true }));

    try {
      const formData = new FormData();
      formData.append('loan_transaction_id', transactionId.toString());

      const res = await fetch('https://api.seregelagebeya.com/api/v1/sms/send-sms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Send SMS failed:', res.status, errorBody);
        alert('Failed to send SMS');
        return;
      }

      const json = await res.json();
      if (json.message === 'SMS job dispatched successfully') {
        alert('SMS sent successfully');
      } else {
        console.warn('Unexpected response:', json);
        alert('SMS sent, but unexpected response received');
      }
    } catch (e) {
      console.warn('Error sending SMS:', e);
      alert('Error sending SMS');
    } finally {
      setSendingSMS(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const handlePay = async (transactionId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setPaying(prev => ({ ...prev, [transactionId]: true }));

    try {
      const res = await fetch(`https://api.seregelagebeya.com/api/v1/loan-transactions/${transactionId}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Payment failed:', res.status, errorBody);
        alert('Failed to process payment');
        return;
      }

      alert('Payment processed successfully');
      fetchData(currentPage); // Refresh data to reflect updated status
    } catch (e) {
      console.warn('Error processing payment:', e);
      alert('Error processing payment');
    } finally {
      setPaying(prev => ({ ...prev, [transactionId]: false }));
    }
  };

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
  }, [userIdSearch, loanAmountSearch, phoneNumberSearch, router]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }

    setCurrentPage(1);
    fetchData(1);
  }, [searchTrigger, fetchData]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }

    fetchData(currentPage);
  }, [currentPage, paginateCount, fetchData]);

  const toggleSection = (userId: number, section: string) => {
    setExpandedSections(prev => {
      const userSections = new Set(prev[userId] || []);
      if (userSections.has(section)) {
        userSections.delete(section);
      } else {
        userSections.add(section);
      }
      return { ...prev, [userId]: userSections };
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
    setLoanAmountSearch('');
    setPhoneNumberSearch('');
    setSearchTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setUsers([]);
    setMeta(null);
    setExpandedSections({});
    fetchData(currentPage);
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
        .loan-transaction-unpaid {
          background-color: #fee2e2;
          color: #b91c1c !important;
        }
        .loan-transaction-unpaid td {
          color: #b91c1c !important;
        }
        .loan-transaction-paid {
          background-color: #dcfce7;
          color: #15803d !important;
        }
        .loan-transaction-paid td {
          color: #15803d !important;
        }
        .loan-transaction-normal {
          background-color: #eff6ff;
          color: #1e40af !important;
        }
        .loan-transaction-normal td {
          color: #1e40af !important;
        }
      `}</style>

      {/* Navigation Bar */}
      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <header className="mb-6 py-4 border-b border-blue-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Overdue Loans Dashboard</h1>
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

      {/* Search Form */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-blue-100">
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
            <label className="block text-sm font-medium text-blue-700 mb-1">Loan Amount</label>
            <input
              type="text"
              value={loanAmountSearch}
              onChange={(e) => setLoanAmountSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter loan amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumberSearch}
              onChange={(e) => setPhoneNumberSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
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

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
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
        <div className="text-center text-blue-600 py-8">Loading overdue loans...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-blue-600 py-8">
          No overdue loans found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => {
            const sections = expandedSections[user.id] || new Set();
            return (
              <div key={user.id} className="bg-white p-4 sm:p-6 rounded-lg shadow border border-blue-100">
                <div className="w-full min-w-0">
                  {/* User Summary Section (Always Visible, Horizontal) */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">User Summary</h2>
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full align-middle">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-sm border border-blue-200 rounded-lg p-4">
                          <div>
                            <div className="font-semibold text-blue-700">First Name</div>
                            <div className="text-1e40af">{renderValue(user.first_name)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Last Name</div>
                            <div className="text-1e40af">{renderValue(user.last_name)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Email</div>
                            <div className="text-1e40af">{renderValue(user.email)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Phone Number</div>
                            <div className="text-1e40af">{renderValue(user.phone_number)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Picture</div>
                            <div className="text-1e40af">
                              {user.fayda_customers[0]?.picture_path ? (
                                <img
                                  src={user.fayda_customers[0].picture_path}
                                  alt={user.fayda_customers[0].name || 'Fayda Customer'}
                                  className="w-16 h-16 object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextSibling!.textContent = 'N/A';
                                  }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fayda Customers Section (Collapsible) */}
                  <div className="mb-4">
                    <div 
                      className="text-sm text-blue-600 cursor-pointer hover:underline font-semibold mb-2"
                      onClick={() => toggleSection(user.id, 'fayda_customers')}
                    >
                      {sections.has('fayda_customers') ? '▲ Hide Fayda Customers' : '▼ Show Fayda Customers'}
                    </div>
                    <AnimatePresence>
                      {sections.has('fayda_customers') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Fayda Customers</h4>
                            {user.fayda_customers.length === 0 ? (
                              <p className="text-sm text-blue-600">No fayda customers found.</p>
                            ) : (
                              <div className="table-container">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>ID</th>
                                      <th>User ID</th>
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
                                        <td>{renderValue(fayda.id)}</td>
                                        <td>{renderValue(fayda.user_id)}</td>
                                        <td>{renderValue(fayda.name)}</td>
                                        <td>{renderValue(fayda.email)}</td>
                                        <td>{renderValue(fayda.sub)}</td>
                                        <td>{renderValue(fayda.phone_number)}</td>
                                        <td>{renderValue(fayda.birthdate)}</td>
                                        <td>{renderValue(fayda.residence_status)}</td>
                                        <td>{renderValue(fayda.gender)}</td>
                                        <td>
                                          {fayda.address
                                            ? `${fayda.address.region}, ${fayda.address.zone}, ${fayda.address.woreda}`
                                            : 'N/A'}
                                        </td>
                                        <td>{renderValue(fayda.nationality)}</td>
                                        <td>{fayda.is_verified ? 'Yes' : 'No'}</td>
                                        <td>{renderValue(new Date(fayda.created_at).toLocaleString())}</td>
                                        <td>{renderValue(new Date(fayda.updated_at).toLocaleString())}</td>
                                        <td>{renderValue(fayda.deleted_at)}</td>
                                        <td>
                                          {fayda.picture_path ? (
                                            <img
                                              src={fayda.picture_path}
                                              alt={fayda.name || 'Fayda Customer'}
                                              className="w-16 h-16 object-cover rounded-md"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextSibling!.textContent = 'N/A';
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Loans Section (Collapsible) */}
                  <div className="mb-4">
                    <div 
                      className="text-sm text-blue-600 cursor-pointer hover:underline font-semibold mb-2"
                      onClick={() => toggleSection(user.id, 'loans')}
                    >
                      {sections.has('loans') ? '▲ Hide Loans' : '▼ Show Loans'}
                    </div>
                    <AnimatePresence>
                      {sections.has('loans') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Loans</h4>
                            {user.loans.map((loan) => (
                              <div key={loan.id} className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-200">
                                {/* Loan Details */}
                                <h5 className="text-sm font-semibold text-blue-900 mb-2">Loan ID: {loan.id}</h5>
                                <div className="overflow-x-auto">
                                  <div className="inline-block min-w-full align-middle">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm border border-blue-200 rounded-lg p-4 bg-white">
                                      <div>
                                        <div className="font-semibold text-blue-700">Loan ID</div>
                                        <div className="text-1e40af">{renderValue(loan.id)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Loan Code</div>
                                        <div className="text-1e40af">{renderValue(loan.loan_code)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Loan Amount</div>
                                        <div className="text-1e40af">{renderValue(loan.loan_amount)} ETB</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Loan Cap</div>
                                        <div className="text-1e40af">{renderValue(loan.loan_cap)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Is Approved</div>
                                        <div className="text-1e40af">{loan.is_approved ? 'Yes' : 'No'}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Is All Amount Spent</div>
                                        <div className="text-1e40af">{loan.is_all_amount_spent ? 'Yes' : 'No'}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Status</div>
                                        <div className="text-1e40af">{renderValue(loan.status)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Payment Completed At</div>
                                        <div className="text-1e40af">{renderValue(loan.payment_completed_at_date)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Repayment Rule</div>
                                        <div className="text-1e40af">{renderValue(loan.repayment_rule)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Description</div>
                                        <div className="text-1e40af">{renderValue(loan.description)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Penalty ID</div>
                                        <div className="text-1e40af">{renderValue(loan.penalty_id)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">User ID</div>
                                        <div className="text-1e40af">{renderValue(loan.user_id)}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Created At</div>
                                        <div className="text-1e40af">{renderValue(new Date(loan.created_at).toLocaleString())}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Updated At</div>
                                        <div className="text-1e40af">{renderValue(new Date(loan.updated_at).toLocaleString())}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-blue-700">Deleted At</div>
                                        <div className="text-1e40af">{renderValue(loan.deleted_at)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Loan Transactions (Collapsible) */}
                                <div className="mt-4">
                                  <div 
                                    className="text-sm text-blue-600 cursor-pointer hover:underline font-semibold mb-2"
                                    onClick={() => toggleSection(user.id, `loan_transactions_${loan.id}`)}
                                  >
                                    {sections.has(`loan_transactions_${loan.id}`) ? '▲ Hide Transactions' : '▼ Show Transactions'}
                                  </div>
                                  <AnimatePresence>
                                    {sections.has(`loan_transactions_${loan.id}`) && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="table-container">
                                          <table className="min-w-full text-sm bg-blue-50 rounded-lg border border-blue-200">
                                            <thead>
                                              <tr className="bg-blue-100">
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Actions</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">ID</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Transaction Code</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Loan ID</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Order ID</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Amount</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Penalty</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Type</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Status</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Paid Date</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Due Date</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Payment Method</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Is Notified</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Penalty ID</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Created At</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Updated At</th>
                                                <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Deleted At</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {loan.loan_transactions.map((transaction) => (
                                                <tr key={transaction.id} className={getTransactionClass(transaction)}>
                                                  <td className="px-3 py-2 border-b border-blue-200">
                                                    {transaction.type === 'LOAN_REPAYMENT' && transaction.status === 'NOT_PAID' && !transaction.paid_date ? (
                                                      <div className="flex space-x-2">
                                                        <button
                                                          onClick={() => handleSendSMS(transaction.id)}
                                                          disabled={sendingSMS[transaction.id]}
                                                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                            sendingSMS[transaction.id]
                                                              ? 'bg-blue-900 text-white cursor-not-allowed'
                                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                                          }`}
                                                        >
                                                          {sendingSMS[transaction.id] ? (
                                                            <>
                                                              <span className="spinner mr-2" />
                                                              Sending...
                                                            </>
                                                          ) : (
                                                            'Send SMS'
                                                          )}
                                                        </button>
                                                        {/* <button
                                                          onClick={() => handlePay(transaction.id)}
                                                          disabled={paying[transaction.id]}
                                                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                            paying[transaction.id]
                                                              ? 'bg-blue-900 text-white cursor-not-allowed'
                                                              : 'bg-green-600 text-white hover:bg-green-700'
                                                          }`}
                                                        >
                                                          {paying[transaction.id] ? (
                                                            <>
                                                              <span className="spinner mr-2" />
                                                              Paying...
                                                            </>
                                                          ) : (
                                                            'Pay'
                                                          )}
                                                        </button> */}
                                                      </div>
                                                    ) : (
                                                      'N/A'
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.id)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.loan_transaction_code)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.loan_id)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.order_id)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.amount)} ETB</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.penalty)} ETB</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.type)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.status)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.paid_date ? new Date(transaction.paid_date).toLocaleString() : 'N/A')}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.due_date ? new Date(transaction.due_date).toLocaleString() : 'N/A')}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.payment_method)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{transaction.is_notified ? 'Yes' : 'No'}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.penalty_id)}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(new Date(transaction.created_at).toLocaleString())}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(new Date(transaction.updated_at).toLocaleString())}</td>
                                                  <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.deleted_at)}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ))}
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

      <footer className="mt-10 pt-6 border-t border-blue-200 text-center text-sm text-blue-600">
        &copy; 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}