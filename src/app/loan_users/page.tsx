'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import NavigationBar from '../components/NavigationBar';

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

export default function LoanUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: Set<string> }>({});
  const [approving, setApproving] = useState<{ [key: number]: boolean }>({});
  const [approveForm, setApproveForm] = useState<{ [key: number]: { loan_cap: string } }>({});
  const [paginateCount, setPaginateCount] = useState(10);
  const [userIdSearch, setUserIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [isApprovedSearch, setIsApprovedSearch] = useState('');
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
      let url = `https://api.seregelagebeya.com/api/v1/loan-users?page=${page}&per_page=${paginateCount}`;
      
      if (userIdSearch) url += `&user_id_search=${encodeURIComponent(userIdSearch)}`;
      if (nameSearch) url += `&name_search=${encodeURIComponent(nameSearch)}`;
      if (emailSearch) url += `&email_search=${encodeURIComponent(emailSearch)}`;
      if (phoneSearch) url += `&phone_search=${encodeURIComponent(phoneSearch)}`;
      if (isApprovedSearch) url += `&is_approved_search=${encodeURIComponent(isApprovedSearch)}`;

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
        console.warn('Users fetch failed:', res.status, errorBody);
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
      console.warn('Error fetching users:', e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [paginateCount, userIdSearch, nameSearch, emailSearch, phoneSearch, isApprovedSearch, router]);

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
  }, [userIdSearch, nameSearch, emailSearch, phoneSearch, isApprovedSearch, router]);

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
    setNameSearch('');
    setEmailSearch('');
    setPhoneSearch('');
    setIsApprovedSearch('');
    setSearchTrigger(prev => prev + 1);
  };

  const handleApproveToggle = (userId: number) => {
    toggleSection(userId, 'approve');
  };

  const handleApproveFormChange = (userId: number, field: string, value: string) => {
    setApproveForm(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId] || { loan_cap: '' },
        [field]: value,
      },
    }));
  };

  const handleApprove = async (userId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const formData = approveForm[userId];
    if (!formData || !formData.loan_cap) {
      alert('Please fill the loan cap field');
      return;
    }

    if (isNaN(Number(formData.loan_cap)) || Number(formData.loan_cap) <= 0) {
      alert('Loan cap must be a positive number');
      return;
    }

    setApproving(prev => ({ ...prev, [userId]: true }));

    try {
      const form = new FormData();
      form.append('_method', 'PUT');
      form.append('loan_cap', formData.loan_cap);

      const res = await fetch(`https://api.seregelagebeya.com/api/v1/loan-users/${userId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: form,
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('User approval failed:', res.status, errorBody);
        alert('Failed to approve user');
        return;
      }

      const json = await res.json();
      const updatedUser = json.data;

      // Update the user in the state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? {
                ...user,
                ...updatedUser,
                loan_user: updatedUser.loan_user || user.loan_user,
              }
            : user
        )
      );

      // Clear form and collapse section
      setApproveForm(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
      toggleSection(userId, 'approve');

      alert('User approved successfully');
    } catch (e) {
      console.warn('Error approving user:', e);
      alert('Error approving user');
    } finally {
      setApproving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRefresh = () => {
    setUsers([]);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Loan Users Dashboard</h1>
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
            <label className="block text-sm font-medium text-blue-700 mb-1">Name</label>
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Email</label>
            <input
              type="text"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Phone</label>
            <input
              type="text"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
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
        <div className="text-center text-blue-600 py-8">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-blue-600 py-8">
          No users found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => {
            const sections = expandedSections[user.id] || new Set();
            return (
              <div key={user.id} className="bg-white p-4 sm:p-6 rounded-lg shadow border border-blue-100">
                <div className="w-full min-w-0">
                  {/* Approve Button and Form */}
                  <div className="mb-4 flex justify-end items-center space-x-2">
                    <button
                      onClick={() => handleApproveToggle(user.id)}
                      disabled={user.loan_user?.is_approved === 1 || approving[user.id]}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                        user.loan_user?.is_approved === 1
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : approving[user.id]
                          ? 'bg-green-700 text-white cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {approving[user.id] ? (
                        <>
                          <span className="spinner mr-2" />
                          Approving...
                        </>
                      ) : user.loan_user?.is_approved === 1 ? (
                        'Approved'
                      ) : (
                        'Approve Loan User'
                      )}
                    </button>
                  </div>

                  {/* Approve Form (Collapsible) */}
                  <AnimatePresence>
                    {sections.has('approve') && !user.loan_user?.is_approved && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="text-sm font-semibold text-blue-900 mb-3">Approve Loan User Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-1">Loan Cap</label>
                              <input
                                type="number"
                                value={approveForm[user.id]?.loan_cap || ''}
                                onChange={(e) => handleApproveFormChange(user.id, 'loan_cap', e.target.value)}
                                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 6000"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={approving[user.id]}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                approving[user.id]
                                  ? 'bg-blue-900 text-white cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {approving[user.id] ? (
                                <>
                                  <span className="spinner mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                'Submit'
                              )}
                            </button>
                            <button
                              onClick={() => toggleSection(user.id, 'approve')}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-200 hover:bg-blue-300 text-blue-900 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* User Details Section (Always Visible) */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">User Details</h2>
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full align-middle">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm border border-blue-200 rounded-lg p-4">
                          <div>
                            <div className="font-semibold text-blue-700">User ID</div>
                            <div>{renderValue(user.id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">User Name</div>
                            <div>{renderValue(user.user_name)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">First Name</div>
                            <div>{renderValue(user.first_name)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Last Name</div>
                            <div>{renderValue(user.last_name)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Email</div>
                            <div>{renderValue(user.email)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Phone Number</div>
                            <div>{renderValue(user.phone_number)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Is Verified</div>
                            <div>{user.is_verified ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Email Verified At</div>
                            <div>{renderValue(user.email_verified_at)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Firebase ID</div>
                            <div>{renderValue(user.firebase_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Wallet Balance</div>
                            <div>{renderValue(user.wallet_balance)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Bypass Quantity Restriction</div>
                            <div>{user.bypass_product_quantity_restriction ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">User Status</div>
                            <div>{renderValue(user.status)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Is Active</div>
                            <div>{user.is_active ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Is System User</div>
                            <div>{user.is_system_user ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Provider</div>
                            <div>{renderValue(user.provider)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Corporate ID</div>
                            <div>{renderValue(user.corporate_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Provider ID</div>
                            <div>{renderValue(user.provider_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Image</div>
                            <div>{renderValue(user.image)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Cover Photo</div>
                            <div>{renderValue(user.cover_photo)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Userable Type</div>
                            <div>{renderValue(user.userable_type)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Userable ID</div>
                            <div>{renderValue(user.userable_id)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Last Active At</div>
                            <div>{renderValue(user.last_active_at)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Created At</div>
                            <div>{renderValue(new Date(user.created_at).toLocaleString())}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700">Updated At</div>
                            <div>{renderValue(new Date(user.updated_at).toLocaleString())}</div>
                          </div>
                          {user.loan_user && (
                            <>
                              <div>
                                <div className="font-semibold text-blue-700">Loan User ID</div>
                                <div>{renderValue(user.loan_user.id)}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">Loan Balance</div>
                                <div>{renderValue(user.loan_user.loan_balance)}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">Loan Cap</div>
                                <div>{renderValue(user.loan_user.loan_cap)}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">Loan User Approved</div>
                                <div>{user.loan_user.is_approved ? 'Yes' : 'No'}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">Approved Date</div>
                                <div>{renderValue(user.loan_user.approved_date)}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">Loan User Created At</div>
                                <div>{renderValue(new Date(user.loan_user.created_at).toLocaleString())}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">Loan User Updated At</div>
                                <div>{renderValue(new Date(user.loan_user.updated_at).toLocaleString())}</div>
                              </div>
                            </>
                          )}
                          <div className="col-span-full">
                            <div className="font-semibold text-blue-700">Deleted At</div>
                            <div>{renderValue(user.deleted_at)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
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