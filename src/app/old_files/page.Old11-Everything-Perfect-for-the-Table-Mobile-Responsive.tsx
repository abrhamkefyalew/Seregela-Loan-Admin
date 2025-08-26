'use client';

import { useState, useEffect } from 'react';
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

  const fetchData = async (page = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/fayda-customers?page=${page}&paginate=${paginateCount}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const json = await res.json();
      setUsers(json.data);
      setMeta(json.meta);
    } catch (e) {
      console.warn(e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, paginateCount]);

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

  const renderValue = (value: any) => (value === null || value === undefined ? 'N/A' : value);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <header className="mb-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Fayda Users List</h1>
      </header>

      <div className="mb-6 text-center">
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

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
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
        &copy; 2025 Seregela Dashboard. All rights reserved.
      </footer>
    </main>
  );
}