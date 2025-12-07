// app/completedLoans/page.tsx
'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationBar from '../components/NavigationBar';

interface User {
  id: number;
  user_name: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string;
  is_verified: number;
  cbe_birr_plus_token: string | null;
  image: string | null;
  wallet_balance: number;
  status: number;
  created_at: string;
  updated_at: string;
}

interface RepaymentRule {
  term_months: string;
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
  transaction_id_banks: string | null;
  bank_to_pay_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Loan {
  id: number;
  loan_code: string | null;
  user_id: number;
  loan_amount: string;
  is_approved: number;
  status: string;
  payment_completed_at_date: string | null;
  repayment_rule: RepaymentRule | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  loan_transactions: LoanTransaction[];
}

interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export default function CompletedLoans() {
  const router = useRouter();
  const pathname = usePathname();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [expandedLoans, setExpandedLoans] = useState<Set<number>>(new Set());

  // Navigation
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
    users: false,
    overdue_loans: false,
    reports: false,
    paid_loan_transactions: false,
    completed_loans: false, // NEW
  });

  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
    '/products': 'products',
    '/users': 'users',
    '/overdue_loans': 'overdue_loans',
    '/reports/excel': 'reports',
    '/loanTransactions': 'paid_loan_transactions',
    '/completedLoans': 'completed_loans', // NEW
  };

  const currentRoute = routeMap[pathname] || '';

  // Fetch
  const fetchLoans = useCallback(
    async (page = 1) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        const url = `https://api.seregelagebeya.com/api/v1/loans?page=${page}&paginate=${perPage}&status_search=PAYMENT_COMPLETED`;

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
          setLoans([]);
          setMeta(null);
          return;
        }

        const json = await res.json();
        setLoans(json.data);
        setMeta(json.meta);
      } catch (e) {
        console.error('Fetch error:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    },
    [perPage, router]
  );

  useEffect(() => {
    fetchLoans(currentPage);
  }, [currentPage, fetchLoans]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (meta?.last_page || 1) && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const toggleLoan = (loanId: number) => {
    setExpandedLoans((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) next.delete(loanId);
      else next.add(loanId);
      return next;
    });
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleString() : 'N/A';

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
        .completed-row {
          background: #ecfdf5 !important;
          color: #166534 !important;
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
          border: 1px solid #86efac;
          background: #f0fdf4;
          font-size: 0.875rem;
        }
        .sub-table th {
          background: #bbf7d0;
          font-weight: 600;
        }
      `}</style>

      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <header className="mb-6 py-4 border-b border-green-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-900">
          Loans [PAYMENT COMPLETED]
        </h1>
      </header>

      {/* Per Page */}
      <div className="mb-4 flex justify-end items-center space-x-2">
        <label className="text-sm font-medium text-green-700">Per page:</label>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="bg-green-50 border border-green-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-green-600">
          <span className="spinner mr-2" />
          Loading completed loans...
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-8 text-green-600">
          No completed loans found.
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-green-600">
            Showing {meta?.from} – {meta?.to} of {meta?.total} completed loans
          </div>

          <div className="table-container bg-white rounded-lg shadow border border-green-100 overflow-hidden">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Terms</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <React.Fragment key={loan.id}>
                    <tr className="completed-row">
                      <td>{loan.id}</td>
                      <td>{loan.user.first_name} {loan.user.last_name}</td>
                      <td>{loan.user.phone_number}</td>
                      <td>{loan.loan_amount} ETB</td>
                      <td>{loan.repayment_rule?.term_months} months</td>
                      <td>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          COMPLETED
                        </span>
                      </td>
                      <td>{formatDate(loan.created_at)}</td>
                      <td>
                        <span
                          className="expand-btn"
                          onClick={() => toggleLoan(loan.id)}
                        >
                          {expandedLoans.has(loan.id)
                            ? 'Hide'
                            : `Show`} ({loan.loan_transactions.length})
                        </span>
                      </td>
                    </tr>

                    {expandedLoans.has(loan.id) && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <table className="sub-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Paid Date</th>
                                <th>Due Date</th>
                                <th>Method</th>
                                <th>Code</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loan.loan_transactions.map((tx) => (
                                <tr key={tx.id}>
                                  <td>{tx.id}</td>
                                  <td>{tx.type}</td>
                                  <td>{tx.amount} ETB</td>
                                  <td>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        tx.status === 'PAID'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      {tx.status || 'N/A'}
                                    </span>
                                  </td>
                                  <td>{formatDate(tx.paid_date)}</td>
                                  <td>{tx.due_date ? new Date(tx.due_date).toLocaleDateString() : 'N/A'}</td>
                                  <td>{tx.payment_method ?? 'N/A'}</td>
                                  <td>{tx.loan_transaction_code ?? 'N/A'}</td>
                                </tr>
                              ))}
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
                className="px-3 py-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
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
                      page === currentPage
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(meta.last_page)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}

      <footer className="mt-10 pt-6 border-t border-green-200 text-center text-sm text-green-600">
        © 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}