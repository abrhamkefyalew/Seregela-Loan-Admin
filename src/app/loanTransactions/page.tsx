// app/loanTransactions/page.tsx
'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationBar from '../components/NavigationBar';

interface Order {
  id: number;
  cnet_id: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  status: string;
  deleted_at: string | null;
  total_cost: number;
  payment_method: string;
  order_cost: number;
  delivery_cost: number;
  store_id: number | null;
  estimated_delivery_cost: string | null;
  acceptor_id: number | null;
  accepted_at: string | null;
  approver_id: number | null;
  approved_at: string | null;
  delivery_response: string | null;
  trip_search_id: string | null;
  otp: string | null;
  delivery_driver_phone_number: string | null;
  estimated_delivery_time: string | null;
  delivered_at: string | null;
  actual_delivery_cost: string | null;
  actual_delivery_time: string | null;
  additional_payment_method: string | null;
  additional_order_payment: string | null;
  delivery_type_id: number;
  airtime_gift_percentage: string | null;
  airtime_gift_response: string | null;
  discount_percentage: string | null;
  discount_type_id: number | null;
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
  repayment_rule: { term_months: string } | null;
  description: string | null;
  penalty_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // ADD THIS:
  user: {
    id: number;
    user_name: string | null;
    first_name: string;
    last_name: string;
    email: string | null;
    phone_number: string;
    is_verified: number;
    email_verified_at: string | null;
    firebase_token: string | null;
    firebase_id: string | null;
    cbe_birr_plus_token: string | null;
    image: string | null;
    cover_photo: string | null;
    provider_id: number | null;
    provider: string | null;
    corporate_id: number | null;
    wallet_balance: number;
    bypass_product_quantity_restriction: number;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_active: number;
    is_system_user: number;
    userable_type: string | null;
    userable_id: number | null;
    last_active_at: string | null;
  };
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  loan: Loan;
  order: Order | null;
}

interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export default function LoanTransactions() {
  const router = useRouter();
  const pathname = usePathname();

  // ── Data ───────────────────────────────────────
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10); // default 10
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  // ── Filters ─────────────────────────────────────
  const [loanIdSearch, setLoanIdSearch] = useState('');
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [amountSearch, setAmountSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('LOAN_REPAYMENT'); // default
  const [statusSearch, setStatusSearch] = useState('PAID');       // default
  const [includeStatusFilter, setIncludeStatusFilter] = useState(true); // toggle

  // ── Navigation ─────────────────────────────────
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
    users: false,
    overdue_loans: false,
    reports: false,
    paid_loan_transactions: false,
  });

  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
    '/products': 'products',
    '/users': 'users',
    '/overdue_loans': 'overdue_loans',
    '/reports/excel': 'reports',
    '/loanTransactions': 'paid_loan_transactions',
  };

  const currentRoute = routeMap[pathname] || '';

  // ── Fetch ───────────────────────────────────────
  const fetchTransactions = useCallback(
    async (page = 1) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        let url = `https://api.seregelagebeya.com/api/v1/loan-transactions?page=${page}&paginate=${perPage}`;

        // Default filters
        url += `&type_search=${typeSearch}`;
        if (includeStatusFilter && statusSearch) {
          url += `&status_search=${statusSearch}`;
        }

        if (loanIdSearch) url += `&loan_id_search=${encodeURIComponent(loanIdSearch)}`;
        if (orderIdSearch) url += `&order_id_search=${encodeURIComponent(orderIdSearch)}`;
        if (amountSearch) url += `&amount_search=${encodeURIComponent(amountSearch)}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          const txt = await res.text();
          console.error('API error:', txt);
          setTransactions([]);
          setMeta(null);
          return;
        }

        const json = await res.json();
        setTransactions(json.data);
        setMeta(json.meta);
      } catch (e) {
        console.error('Fetch error:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    },
    [perPage, typeSearch, statusSearch, includeStatusFilter, loanIdSearch, orderIdSearch, amountSearch, router]
  );

  // ── Effects ─────────────────────────────────────
  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, fetchTransactions]);

  // ── Pagination ──────────────────────────────────
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (meta?.last_page || 1) && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // ── Search & Reset ──────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions(1);
  };

  const handleClear = () => {
    setLoanIdSearch('');
    setOrderIdSearch('');
    setAmountSearch('');
    setTypeSearch('LOAN_PURCHASE');
    setStatusSearch('PAID');
    setIncludeStatusFilter(true);
    setCurrentPage(1);
    fetchTransactions(1);
  };

  // ── Expand Order ────────────────────────────────
  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  // ── Render Helpers ──────────────────────────────
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleString() : 'N/A';

  const getRowClass = (t: LoanTransaction) => {
    if (t.status === 'PAID') return 'bg-green-50 text-green-800';
    if (t.status === 'NOT_PAID') return 'bg-red-50 text-red-800';
    return 'bg-blue-50 text-blue-800';
  };

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 p-4 sm:p-6">
      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .table-container {
          overflow-x: auto;
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
          background: #f3f4f6;
          font-weight: 600;
          color: #1e40af;
        }
        .expand-btn {
          cursor: pointer;
          font-weight: bold;
          color: #1e40af;
        }
        .sub-table {
          width: 100%;
          margin-top: 8px;
          border-collapse: collapse;
        }
        .sub-table th,
        .sub-table td {
          padding: 6px 8px;
          border: 1px solid #93c5fd;
          background: #dbeafe;
          font-size: 0.875rem;
        }
        .sub-table th {
          background: #bfdbfe;
          font-weight: 600;
        }
      `}</style>

      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <header className="mb-6 py-4 border-b border-blue-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">
          Loan Transactions
        </h1>
      </header>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-blue-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Loan ID</label>
            <input
              type="text"
              value={loanIdSearch}
              onChange={(e) => setLoanIdSearch(e.target.value)}
              placeholder="e.g. 22"
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Order ID</label>
            <input
              type="text"
              value={orderIdSearch}
              onChange={(e) => setOrderIdSearch(e.target.value)}
              placeholder="e.g. 34000"
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Amount (≤)</label>
            <input
              type="text"
              value={amountSearch}
              onChange={(e) => setAmountSearch(e.target.value)}
              placeholder="e.g. 5550"
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Type</label>
            <select
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOAN_PURCHASE">LOAN_PURCHASE</option>
              <option value="LOAN_REPAYMENT">LOAN_REPAYMENT</option>
              <option value="LOAN_TAKE">LOAN_TAKE</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
              <select
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                disabled={!includeStatusFilter}
                className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="PAID">PAID</option>
                <option value="NOT_PAID">NOT_PAID</option>
              </select>
            </div>
            <label className="flex items-center space-x-1 text-sm">
              <input
                type="checkbox"
                checked={includeStatusFilter}
                onChange={(e) => setIncludeStatusFilter(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Filter by status</span>
            </label>
          </div>

          <div className="col-span-full flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-blue-700">Per page:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-blue-50 border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center py-8 text-blue-600">
          <span className="spinner mr-2" />
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-blue-600">
          No transactions match the filters.
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-blue-600">
            Showing {meta?.from} – {meta?.to} of {meta?.total} transactions
          </div>

          <div className="table-container bg-white rounded-lg shadow border border-blue-100 overflow-hidden">
            <table>
              <thead>
                <tr>
                  <>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Loan ID</th>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                  </>
                  {transactions.some((t) => t.type === 'LOAN_PURCHASE' && t.order) && <th>Order</th>}
                </tr>
              </thead> 
              {/* <thead>
                <tr>
                  <th>ID</th><th>Code</th><th>Loan ID</th><th>Order ID</th><th>Amount</th><th>Type</th><th>Status</th><th>Paid Date</th><th>Due Date</th><th>Created</th><th>User ID</th><th>Name</th><th>Phone</th><th>Email</th>
                  {transactions.some((t) => t.type === 'LOAN_PURCHASE' && t.order) && <th>Order</th>}
                </tr>
              </thead> */}
              <tbody>
                {transactions.map((t) => (
                  <React.Fragment key={t.id}>
                    <tr className={getRowClass(t)}>
                      {[
                        t.id,
                        t.loan_transaction_code ?? 'N/A',
                        t.loan_id,
                        t.order_id ?? 'N/A',
                        `${t.amount} ETB`,
                        t.type,
                        <span
                          key="status"
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : t.status === 'NOT_PAID'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t.status || 'N/A'}
                        </span>,
                        formatDate(t.paid_date),
                        t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A',
                        formatDate(t.created_at),
                        t.loan?.user?.id ?? 'N/A',
                        t.loan?.user ? `${t.loan.user.first_name} ${t.loan.user.last_name}` : 'N/A',
                        t.loan?.user?.phone_number ?? 'N/A',
                        t.loan?.user?.email ?? 'N/A',
                      ].map((cell, index) => (
                        <td key={index}>{cell}</td>
                      ))}
                      {t.type === 'LOAN_PURCHASE' && t.order && (
                        <td>
                          <span
                            className="expand-btn"
                            onClick={() => toggleOrder(t.order!.id)}
                          >
                            {expandedOrders.has(t.order!.id) ? 'Hide' : 'Show'} Order
                          </span>
                        </td>
                      )}
                    </tr>

                    {/* Expandable Order Row */}
                    {t.type === 'LOAN_PURCHASE' && t.order && expandedOrders.has(t.order.id) && (
                      <tr>
                        <td colSpan={15} className="p-0">
                          <table className="sub-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>CNET ID</th>
                                <th>User ID</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Payment Method</th>
                                <th>Store ID</th>
                                <th>Created At</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{t.order.id}</td>
                                <td>{t.order.cnet_id ?? 'N/A'}</td>
                                <td>{t.order.user_id}</td>
                                <td>{t.order.total_cost} ETB</td>
                                <td>{t.order.status}</td>
                                <td>{t.order.payment_method}</td>
                                <td>{t.order.store_id ?? 'N/A'}</td>
                                <td>{formatDate(t.order.created_at)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > meta.last_page) return null;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded ${
                      page === currentPage ? 'bg-blue-600 text-white' : 'bg-blue-100 hover:bg-blue-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(meta.last_page)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}

      <footer className="mt-10 pt-6 border-t border-blue-200 text-center text-sm text-blue-600">
        © 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}