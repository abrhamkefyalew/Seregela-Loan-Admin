'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

interface Address {
  zone: string;
  region: string;
  woreda: string;
}

interface UserNested {
  [key: string]: any;
}

interface UserDetail {
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
  address: Address;
  nationality: string | null;
  is_verified: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: UserNested;
}

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [paginateCount, setPaginateCount] = useState(10);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  const fetchData = useCallback(async (page = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/fayda-customers?page=${page}&paginate=${paginateCount}`;
      
      if (phoneSearch) {
        url += `&phone_number_search=${encodeURIComponent(phoneSearch)}`;
      }
      
      if (nameSearch) {
        url += `&name_search=${encodeURIComponent(nameSearch)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      //
      // if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      // Handle unauthorized cases
      if (res.status === 401 || res.status === 403) {
        console.warn('Unauthorized access - redirecting to login:', {
          status: res.status,
        });
        router.push('/login');
        return;
      }

      // Handle other non-successful responses
      if (!res.ok) {
        const errorBody = await res.text(); // Optional: parse response error body safely
        // console.log('Dashboard fetch failed:', res.status, errorBody);
        console.warn('Fayda users fetch failed:', res.status, errorBody);
        router.push('/login');
        return;
      }
      //
      const json = await res.json();
      setUsers(json.data);
      setMeta(json.meta);
    } catch (e) {
      console.warn(e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [paginateCount, phoneSearch, nameSearch, router]);

  // Debounce search implementation
  useEffect(() => {
    //
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }
    //
    const handler = setTimeout(() => {
      setSearchTrigger(prev => prev + 1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [phoneSearch, nameSearch]);

  useEffect(() => {
    //
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }
    //
    setCurrentPage(1);
    fetchData(1);
  }, [searchTrigger]);

  useEffect(() => {
    //
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }
    //
    fetchData(currentPage);
  }, [currentPage, paginateCount, fetchData]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger(prev => prev + 1);
  };

  const handleClearSearch = () => {
    setPhoneSearch('');
    setNameSearch('');
    setSearchTrigger(prev => prev + 1);
  };

  const renderValue = (value: any) => (value === null || value === undefined ? 'N/A' : value);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <header className="mb-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Fayda Users List</h1>
      </header>

      {/* Search Form */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Search by Phone</label>
            <input
              type="text"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Search by Name</label>
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="Enter name"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <label className="mr-2 text-sm">Items per page:</label>
          <select
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
            value={paginateCount}
            onChange={(e) => setPaginateCount(Number(e.target.value))}
          >
            {[3, 5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        
        {meta && (
          <div className="text-sm text-gray-400">
            Showing {meta.from} to {meta.to} of {meta.total} results
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No users found. {phoneSearch || nameSearch ? 'Try different search terms.' : ''}
        </div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <img
                  src={user.picture_path}
                  alt={user.name}
                  className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-xl border border-gray-700 mx-auto sm:mx-0"
                />
                <div className="w-full min-w-0">
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <div className="grid grid-cols-3 gap-0 text-sm border border-gray-600 rounded-lg" style={{ minWidth: '650px' }}>
                        {/* Row 1 */}
                        <div className="border-b border-gray-600 p-3 border-r border-gray-600">
                          <div className="font-semibold text-gray-400">Name</div>
                          <div className="break-words">{renderValue(user.name)}</div>
                        </div>
                        <div className="border-b border-gray-600 p-3 border-r border-gray-600">
                          <div className="font-semibold text-gray-400">Phone</div>
                          <div className="break-words">{renderValue(user.phone_number)}</div>
                        </div>
                        <div className="border-b border-gray-600 p-3">
                          <div className="font-semibold text-gray-400">Gender</div>
                          <div className="break-words">{renderValue(user.gender)}</div>
                        </div>

                        {/* Row 2 */}
                        <div className="border-b border-gray-600 p-3 border-r border-gray-600">
                          <div className="font-semibold text-gray-400">Email</div>
                          <div className="break-words">{renderValue(user.email)}</div>
                        </div>
                        <div className="border-b border-gray-600 p-3 border-r border-gray-600">
                          <div className="font-semibold text-gray-400">Birthdate</div>
                          <div className="break-words">{renderValue(user.birthdate)}</div>
                        </div>
                        <div className="border-b border-gray-600 p-3">
                          <div className="font-semibold text-gray-400">Nationality</div>
                          <div className="break-words">{renderValue(user.nationality)}</div>
                        </div>

                        {/* Row 3 */}
                        <div className="p-3 border-r border-gray-600">
                          <div className="font-semibold text-gray-400">Sub</div>
                          <div className="break-words">{renderValue(user.sub)}</div>
                        </div>
                        <div className="p-3 border-r border-gray-600">
                          <div className="font-semibold text-gray-400">Verified</div>
                          <div className="break-words">{renderValue(user.is_verified)}</div>
                        </div>
                        <div className="p-3">
                          <div className="font-semibold text-gray-400">Status</div>
                          <div className="break-words">{renderValue(user.residence_status)}</div>
                        </div>

                        {/* Address Section - Full width */}
                        <div className="col-span-3 p-3 border-t border-gray-600">
                          <div className="font-semibold text-gray-400 mb-1">Address</div>
                          <div className="grid grid-cols-3 gap-2 text-sm bg-gray-700 rounded-md p-2 border border-gray-600">
                            <div>
                              <div className="font-semibold text-gray-400">Region</div>
                              <div className="break-words">{renderValue(user.address.region)}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-400">Zone</div>
                              <div className="break-words">{renderValue(user.address.zone)}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-400">Woreda</div>
                              <div className="break-words">{renderValue(user.address.woreda)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-blue-400 cursor-pointer hover:underline" onClick={() => toggleRow(user.id)}>
                    {expandedRows.has(user.id) ? '▲ Hide Details' : '▼ Show Details'}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedRows.has(user.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm bg-gray-700 rounded-md">
                        <thead>
                          <tr>
                            {Object.keys(user.user).map((key) => (
                              <th key={key} className="px-3 py-2 text-left border-b border-gray-600">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {Object.values(user.user).map((val, i) => (
                              <td key={i} className="px-3 py-2 border-b border-gray-600 break-words">
                                {renderValue(val)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Pagination */}
          {meta && (
            <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`px-3 py-1 border rounded hover:bg-gray-700 ${
                    num === currentPage ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 border rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="mt-10 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
        &copy; 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}