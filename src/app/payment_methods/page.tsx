// src/app/payment_methods/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/app/components/NavigationBar';

interface PaymentMethod {
  id: number;
  payment_method_name: string;
  description: string | null;
  additional_details: string | null;
  is_active: number;
  is_active_android: number;
  is_active_ios: number;
  is_active_web: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    payment_method_name: '',
    description: '',
    is_active: '1',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({});
  const currentRoute = "payment_methods";

  const routeMap: { [key: string]: string } = { /* ... your existing routeMap */ };

  // Fetch Payment Methods
  const fetchPaymentMethods = useCallback(async (page = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.seregelagebeya.com/api/v1/payment-methods?page=${page}&paginate=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch');

      const json = await res.json();
      setPaymentMethods(json.data || []);
      setMeta(json.meta || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [perPage, router]);

  useEffect(() => {
    fetchPaymentMethods(currentPage);
  }, [currentPage, fetchPaymentMethods]);

  // Open Modal for Create
  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({ payment_method_name: '', description: '', is_active: '1' });
    setError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      payment_method_name: method.payment_method_name,
      description: method.description || '',
      is_active: method.is_active.toString(),
    });
    setError(null);
    setIsModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const url = editingMethod 
      ? `https://api.seregelagebeya.com/api/v1/payment-methods/${editingMethod.id}`
      : `https://api.seregelagebeya.com/api/v1/payment-methods`;

    const form = new FormData();
    form.append('payment_method_name', formData.payment_method_name);
    form.append('description', formData.description);
    form.append('is_active', formData.is_active);

    if (editingMethod) {
      form.append('_method', 'put');
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || 'Something went wrong');
        if (json.errors) {
          setError(Object.values(json.errors).flat().join(', '));
        }
        return;
      }

      // Success
      alert(editingMethod ? 'Payment method updated successfully!' : 'Payment method created successfully!');
      setIsModalOpen(false);
      fetchPaymentMethods(currentPage); // Refresh list
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

    return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <div className="w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Total: {meta?.total || 0} methods
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2"
            >
              + Add New Payment Method
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Additional Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Web</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Android</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">iOS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Updated At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentMethods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {method.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {method.payment_method_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {method.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {method.additional_details || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {method.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {method.is_active_web ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {method.is_active_android ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {method.is_active_ios ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(method.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(method.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(method)}
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center mt-10 gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium border transition-all ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Method Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.payment_method_name}
                  onChange={(e) => setFormData({ ...formData, payment_method_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 h-28 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-70 transition-colors"
                >
                  {submitting ? 'Saving...' : editingMethod ? 'Update Method' : 'Create Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}