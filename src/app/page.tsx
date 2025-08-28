'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import NavigationBar from './components/NavigationBar';

interface User {
  id: number;
  user_name: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string;
  is_verified: number;
  email_verified_at: string | null;
  firebase_token: string | null;
  firebase_id: string;
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
  loan_user?: {
    id: number;
    user_id: number;
    loan_balance: string;
    loan_cap: string;
    is_approved: number;
    approved_date: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

interface LoanTransaction {
  id: number;
  loan_transaction_code: string | null;
  loan_id: number;
  order_id: string | null;
  amount: string;
  penalty: string;
  type: string;
  status: string | null;
  paid_date: string | null;
  due_date: string | null;
  payment_method: string | null;
  is_notified: number;
  penalty_id: string | null;
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
  is_all_amount_spent: string | null;
  status: string;
  payment_completed_at_date: string | null;
  repayment_rule: string | null;
  description: string;
  penalty_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: User;
  loan_transactions: LoanTransaction[];
}

export default function Loans() {
  const router = useRouter();
  const pathname = usePathname();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: Set<string> }>({});
  const [approving, setApproving] = useState<{ [key: number]: boolean }>({});
  const [approveForm, setApproveForm] = useState<{ [key: number]: { loan_amount: string; term_months: string; description: string; loan_cap: string } }>({});
  const [paginateCount, setPaginateCount] = useState(10);
  const [userIdSearch, setUserIdSearch] = useState('');
  const [loanAmountSearch, setLoanAmountSearch] = useState('');
  const [isApprovedSearch, setIsApprovedSearch] = useState('');
  const [statusSearch, setStatusSearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
  });

  // Map routes to nav items
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
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
      let url = `https://api.seregelagebeya.com/api/v1/loans?page=${page}&per_page=${paginateCount}`;
      
      if (userIdSearch) url += `&user_id_search=${encodeURIComponent(userIdSearch)}`;
      if (loanAmountSearch) url += `&loan_amount_search=${encodeURIComponent(loanAmountSearch)}`;
      if (isApprovedSearch) url += `&is_approved_search=${encodeURIComponent(isApprovedSearch)}`;
      if (statusSearch) url += `&status_search=${encodeURIComponent(statusSearch)}`;
      if (descriptionSearch) url += `&description_search=${encodeURIComponent(descriptionSearch)}`;

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
        console.warn('Loans fetch failed:', res.status, errorBody);
        if (res.status !== 422) {
          router.push('/login');
        }
        setLoans([]);
        setMeta(null);
        return;
      }

      const json = await res.json();
      setLoans(json.data);
      setMeta(json.meta);
    } catch (e) {
      console.warn('Error fetching loans:', e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [paginateCount, userIdSearch, loanAmountSearch, isApprovedSearch, statusSearch, descriptionSearch, router]);

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
  }, [userIdSearch, loanAmountSearch, isApprovedSearch, statusSearch, descriptionSearch, router]);

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

  const toggleSection = (loanId: number, section: string) => {
    setExpandedSections(prev => {
      const loanSections = new Set(prev[loanId] || []);
      if (loanSections.has(section)) {
        loanSections.delete(section);
      } else {
        loanSections.add(section);
      }
      return { ...prev, [loanId]: loanSections };
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
    setIsApprovedSearch('');
    setStatusSearch('');
    setDescriptionSearch('');
    setSearchTrigger(prev => prev + 1);
  };

  const handleApproveToggle = (loanId: number) => {
    toggleSection(loanId, 'approve');
  };

  const handleApproveFormChange = (loanId: number, field: string, value: string) => {
    setApproveForm(prev => ({
      ...prev,
      [loanId]: {
        ...prev[loanId] || { loan_amount: '', term_months: '', description: '', loan_cap: '' },
        [field]: value,
      },
    }));
  };

  const handleApprove = async (loanId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const formData = approveForm[loanId];
    if (!formData || !formData.loan_amount || !formData.term_months || !formData.description || !formData.loan_cap) {
      alert('Please fill all approval fields');
      return;
    }

    if (isNaN(Number(formData.loan_amount)) || Number(formData.loan_amount) <= 0) {
      alert('Loan amount must be a positive number');
      return;
    }

    if (isNaN(Number(formData.term_months)) || Number(formData.term_months) <= 0 || !Number.isInteger(Number(formData.term_months))) {
      alert('Term months must be a positive integer');
      return;
    }

    if (isNaN(Number(formData.loan_cap)) || Number(formData.loan_cap) <= 0) {
      alert('Loan cap must be a positive number');
      return;
    }

    setApproving(prev => ({ ...prev, [loanId]: true }));

    try {
      const form = new FormData();
      form.append('_method', 'PUT');
      form.append('loan_amount', formData.loan_amount);
      form.append('repayment_rule[term_months]', formData.term_months);
      form.append('description', formData.description);
      form.append('loan_cap', formData.loan_cap);

      const res = await fetch(`https://api.seregelagebeya.com/api/v1/loans/${loanId}/approve-loan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: form,
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Loan approval failed:', res.status, errorBody);
        alert('Failed to approve loan');
        return;
      }

      const json = await res.json();
      const updatedLoan = json.data;

      // Update the loan in the state
      setLoans(prev =>
        prev.map(loan =>
          loan.id === loanId
            ? {
                ...loan,
                ...updatedLoan,
                user: {
                  ...loan.user,
                  ...updatedLoan.user,
                  loan_user: updatedLoan.user?.loan_user || loan.user.loan_user,
                },
                loan_transactions: updatedLoan.loan_transactions || loan.loan_transactions,
              }
            : loan
        )
      );

      // Clear form and collapse section
      setApproveForm(prev => {
        const { [loanId]: _, ...rest } = prev;
        return rest;
      });
      toggleSection(loanId, 'approve');

      alert('Loan approved successfully');
    } catch (e) {
      console.warn('Error approving loan:', e);
      alert('Error approving loan');
    } finally {
      setApproving(prev => ({ ...prev, [loanId]: false }));
    }
  };

  const handleRefresh = () => {
    setLoans([]);
    setMeta(null);
    fetchData(currentPage);
  };

  const renderValue = (value: any) => (value === null || value === undefined ? 'N/A' : value);

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 p-4 sm:p-6">
      {/* Navigation Bar */}
      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <header className="mb-6 py-4 border-b border-blue-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Loans Dashboard</h1>
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

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
            <select
              value={statusSearch}
              onChange={(e) => setStatusSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="PAYMENT_NOT_COMPLETED">Payment Not Completed</option>
              <option value="PAYMENT_COMPLETED">Payment Completed</option>
              <option value="NOT_APPROVED">Not Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Description</label>
            <input
              type="text"
              value={descriptionSearch}
              onChange={(e) => setDescriptionSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
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
        <div className="text-center text-blue-600 py-8">Loading loans...</div>
      ) : loans.length === 0 ? (
        <div className="text-center text-blue-600 py-8">
          No loans found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => {
            const sections = expandedSections[loan.id] || new Set();
            return (
              <div key={loan.id} className="bg-white p-4 sm:p-6 rounded-lg shadow border border-blue-100">
                <div className="w-full min-w-0">
                  {/* Approve Button and Form */}
                  <div className="mb-4 flex justify-end items-center space-x-2">
                    <button
                      onClick={() => handleApproveToggle(loan.id)}
                      disabled={loan.is_approved === 1 || approving[loan.id]}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                        loan.is_approved === 1
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : approving[loan.id]
                          ? 'bg-green-700 text-white cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {approving[loan.id] ? (
                        <>
                          <span className="spinner mr-2" />
                          Approving...
                        </>
                      ) : loan.is_approved === 1 ? (
                        'Approved'
                      ) : (
                        'Approve Loan'
                      )}
                    </button>
                  </div>

                  {/* Approve Form (Collapsible) */}
                  <AnimatePresence>
                    {sections.has('approve') && !loan.is_approved && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="text-sm font-semibold text-blue-900 mb-3">Approve Loan Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-1">Loan Amount</label>
                              <input
                                type="number"
                                value={approveForm[loan.id]?.loan_amount || ''}
                                onChange={(e) => handleApproveFormChange(loan.id, 'loan_amount', e.target.value)}
                                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 15200"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-1">Term Months</label>
                              <input
                                type="number"
                                value={approveForm[loan.id]?.term_months || ''}
                                onChange={(e) => handleApproveFormChange(loan.id, 'term_months', e.target.value)}
                                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 3"
                                min="1"
                                step="1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={approveForm[loan.id]?.description || ''}
                                onChange={(e) => handleApproveFormChange(loan.id, 'description', e.target.value)}
                                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., first loan approved"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-1">Loan Cap</label>
                              <input
                                type="number"
                                value={approveForm[loan.id]?.loan_cap || ''}
                                onChange={(e) => handleApproveFormChange(loan.id, 'loan_cap', e.target.value)}
                                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 6000"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(loan.id)}
                              disabled={approving[loan.id]}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                approving[loan.id]
                                  ? 'bg-blue-900 text-white cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {approving[loan.id] ? (
                                <>
                                  <span className="spinner mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                'Submit'
                              )}
                            </button>
                            <button
                              onClick={() => toggleSection(loan.id, 'approve')}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-200 hover:bg-blue-300 text-blue-900 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loan Details Section (Always Visible) */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Loan Details</h2>
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full align-middle">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm border border-blue-200 rounded-lg p-4">
                          <div>
                            <div className="font-semibold text-blue-700">Loan ID</div>
                            <div>{renderValue(loan.id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Loan Code</div>
                            <div>{renderValue(loan.loan_code)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Loan Amount</div>
                            <div>{renderValue(loan.loan_amount)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Loan Cap</div>
                            <div>{renderValue(loan.loan_cap)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Is Approved</div>
                            <div>{loan.is_approved ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Is All Amount Spent</div>
                            <div>{renderValue(loan.is_all_amount_spent)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Status</div>
                            <div>{renderValue(loan.status)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Payment Completed At</div>
                            <div>{renderValue(loan.payment_completed_at_date)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Repayment Rule</div>
                            <div>{renderValue(loan.repayment_rule)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Description</div>
                            <div>{renderValue(loan.description)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Penalty ID</div>
                            <div>{renderValue(loan.penalty_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">User ID</div>
                            <div>{renderValue(loan.user_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Created At</div>
                            <div>{renderValue(new Date(loan.created_at).toLocaleString())}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Updated At</div>
                            <div>{renderValue(new Date(loan.updated_at).toLocaleString())}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Deleted At</div>
                            <div>{renderValue(loan.deleted_at)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Details Section (Collapsible) */}
                  <div className="mb-4">
                    <div 
                      className="text-sm text-blue-600 cursor-pointer hover:underline font-semibold mb-2"
                      onClick={() => toggleSection(loan.id, 'user')}
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
                                  <div>{renderValue(loan.user.id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">User Name</div>
                                  <div>{renderValue(loan.user.user_name)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">First Name</div>
                                  <div>{renderValue(loan.user.first_name)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Last Name</div>
                                  <div>{renderValue(loan.user.last_name)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Email</div>
                                  <div>{renderValue(loan.user.email)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Phone Number</div>
                                  <div>{renderValue(loan.user.phone_number)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Is Verified</div>
                                  <div>{loan.user.is_verified ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Email Verified At</div>
                                  <div>{renderValue(loan.user.email_verified_at)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Firebase ID</div>
                                  <div>{renderValue(loan.user.firebase_id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Wallet Balance</div>
                                  <div>{renderValue(loan.user.wallet_balance)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Bypass Quantity Restriction</div>
                                  <div>{loan.user.bypass_product_quantity_restriction ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">User Status</div>
                                  <div>{renderValue(loan.user.status)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Is Active</div>
                                  <div>{loan.user.is_active ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Is System User</div>
                                  <div>{loan.user.is_system_user ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Provider</div>
                                  <div>{renderValue(loan.user.provider)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Corporate ID</div>
                                  <div>{renderValue(loan.user.corporate_id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Provider ID</div>
                                  <div>{renderValue(loan.user.provider_id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Image</div>
                                  <div>{renderValue(loan.user.image)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Cover Photo</div>
                                  <div>{renderValue(loan.user.cover_photo)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Userable Type</div>
                                  <div>{renderValue(loan.user.userable_type)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Userable ID</div>
                                  <div>{renderValue(loan.user.userable_id)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Last Active At</div>
                                  <div>{renderValue(loan.user.last_active_at)}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Created At</div>
                                  <div>{renderValue(new Date(loan.user.created_at).toLocaleString())}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-700">Updated At</div>
                                  <div>{renderValue(new Date(loan.user.updated_at).toLocaleString())}</div>
                                </div>
                                {loan.user.loan_user && (
                                  <>
                                    <div>
                                      <div className="font-semibold text-blue-700">Loan User ID</div>
                                      <div>{renderValue(loan.user.loan_user.id)}</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">Loan Balance</div>
                                      <div>{renderValue(loan.user.loan_user.loan_balance)}</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">Loan Cap</div>
                                      <div>{renderValue(loan.user.loan_user.loan_cap)}</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">Loan User Approved</div>
                                      <div>{loan.user.loan_user.is_approved ? 'Yes' : 'No'}</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">Approved Date</div>
                                      <div>{renderValue(loan.user.loan_user.approved_date)}</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">Loan User Created At</div>
                                      <div>{renderValue(new Date(loan.user.loan_user.created_at).toLocaleString())}</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">Loan User Updated At</div>
                                      <div>{renderValue(new Date(loan.user.loan_user.updated_at).toLocaleString())}</div>
                                    </div>
                                  </>
                                )}
                                <div className="col-span-full">
                                  <div className="font-semibold text-blue-700">Deleted At</div>
                                  <div>{renderValue(loan.user.deleted_at)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Loan Transactions Section (Collapsible) */}
                  <div>
                    <div 
                      className="text-sm text-blue-600 cursor-pointer hover:underline font-semibold mb-2"
                      onClick={() => toggleSection(loan.id, 'transactions')}
                    >
                      {sections.has('transactions') ? '▲ Hide Transactions' : '▼ Show Transactions'}
                    </div>
                    <AnimatePresence>
                      {sections.has('transactions') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm bg-blue-50 rounded-lg border border-blue-200">
                              <thead>
                                <tr className="bg-blue-100">
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
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Request Payload</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Transaction ID Banks</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Response Payload</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Bank Payment Logic Data</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Bank To Pay URL</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Created At</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Updated At</th>
                                  <th className="px-3 py-2 text-left border-b border-blue-200 font-semibold text-blue-700">Deleted At</th>
                                </tr>
                              </thead>
                              <tbody>
                                {loan.loan_transactions.map((transaction) => (
                                  <tr key={transaction.id}>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.id)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.loan_transaction_code)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.loan_id)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.order_id)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.amount)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.penalty)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.type)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.status)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.paid_date ? new Date(transaction.paid_date).toLocaleString() : 'N/A')}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.due_date ? new Date(transaction.due_date).toLocaleString() : 'N/A')}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.payment_method)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{transaction.is_notified ? 'Yes' : 'No'}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.penalty_id)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.request_payload)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.transaction_id_banks)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.response_payload)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.bank_payment_logic_data)}</td>
                                    <td className="px-3 py-2 border-b border-blue-200">{renderValue(transaction.bank_to_pay_url)}</td>
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