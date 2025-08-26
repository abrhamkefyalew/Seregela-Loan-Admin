'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

interface Address {
  zone: string;
  region: string;
  woreda: string;
}

interface UserDetail {
  id: number;
  user_id: number;
  name: string;
  email: string | null;
  phone_number: string;
  birthdate: string;
  gender: string;
  address: Address;
  picture_path: string;
  created_at: string;
  user: Record<string, any>;
}

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchData = async (page = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/loan-customers?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const json = await res.json();
      setUsers(json.data);
      setMeta(json.meta);
    } catch (e) {
      console.error(e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const displayValue = (val: any) => (val === null || val === undefined || val === '' ? 'N/A' : val);

  return (
    <main className="bg-gray-900 text-white min-h-screen p-6">
      <header className="mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white">Fayda Users Dashboard</h1>
      </header>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-800 p-5 rounded-xl shadow">
              <div className="flex gap-6 items-start">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE}/${user.picture_path}`}
                  alt="User"
                  className="w-24 h-24 object-cover rounded-full border border-gray-600"
                />
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-left border-b border-gray-700">
                        <th className="py-1 pr-6">Name</th>
                        <th className="py-1 pr-6">Phone</th>
                        <th className="py-1 pr-6">Email</th>
                        <th className="py-1 pr-6">Gender</th>
                        <th className="py-1 pr-6">Birthdate</th>
                        <th className="py-1 pr-6">Verified</th>
                        <th className="py-1 pr-6">Nationality</th>
                        <th className="py-1 pr-6">Address</th>
                        <th className="py-1 pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-700">
                        <td className="py-2 pr-6">{displayValue(user.name)}</td>
                        <td className="py-2 pr-6">{displayValue(user.phone_number)}</td>
                        <td className="py-2 pr-6">{displayValue(user.email)}</td>
                        <td className="py-2 pr-6">{displayValue(user.gender)}</td>
                        <td className="py-2 pr-6">{displayValue(user.birthdate)}</td>
                        {/* <td className="py-2 pr-6">{user.is_verified ? 'Yes' : 'N/A'}</td>
                        <td className="py-2 pr-6">{displayValue(user.nationality)}</td> */}
                        <td className="py-2 pr-6">
                          <table className="border border-gray-700 rounded text-xs">
                            <tbody>
                              <tr>
                                <td className="px-2 py-1 font-semibold">Region</td>
                                <td className="px-2 py-1">{displayValue(user.address.region)}</td>
                              </tr>
                              <tr>
                                <td className="px-2 py-1 font-semibold">Zone</td>
                                <td className="px-2 py-1">{displayValue(user.address.zone)}</td>
                              </tr>
                              <tr>
                                <td className="px-2 py-1 font-semibold">Woreda</td>
                                <td className="px-2 py-1">{displayValue(user.address.woreda)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td className="py-2 pr-6">
                          <button
                            className="text-blue-400 hover:underline"
                            onClick={() => toggleRow(user.id)}
                          >
                            {expandedRows.has(user.id) ? '▲ Hide Details' : '▼ Show Details'}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <AnimatePresence>
                    {expandedRows.has(user.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <table className="w-full text-xs bg-gray-700 rounded-lg">
                          <thead>
                            <tr className="text-gray-300">
                              {Object.keys(user.user).map((key) => (
                                <th key={key} className="px-2 py-1 text-left border-r border-gray-600 last:border-r-0">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {Object.values(user.user).map((val, idx) => (
                                <td
                                  key={idx}
                                  className="px-2 py-1 text-white border-r border-gray-600 last:border-r-0"
                                >
                                  {displayValue(val)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}

          {meta && (
            <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`px-3 py-1 border rounded hover:bg-gray-700 ${
                    num === currentPage ? 'bg-blue-500 text-white' : 'border-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.last_page}
                className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="mt-12 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Fayda Dashboard. All rights reserved.
      </footer>
    </main>
  );
}
