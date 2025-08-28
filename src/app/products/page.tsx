'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  name_am: string;
  is_active: number;
  products_count: number;
  image_path: string | null;
  created_at: string;
  deleted_at: string | null;
}

interface Product {
  id: number;
  name: string;
  price: string;
  total_quantity: number;
  image_paths: string[];
  is_loan_eligible: boolean;
}

interface ProductMeta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

export default function Products() {
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    users: false,
    products: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0); // Default to "All Products"
  const [productsByCategory, setProductsByCategory] = useState<{ [key: number]: Product[] }>({});
  const [productLoading, setProductLoading] = useState<{ [key: number]: boolean }>({});
  const [productError, setProductError] = useState<{ [key: number]: string | null }>({});
  const [productMeta, setProductMeta] = useState<{ [key: number]: ProductMeta }>({});
  const [productPage, setProductPage] = useState<{ [key: number]: number }>({});
  const [toggling, setToggling] = useState<{ [key: number]: boolean }>({});
  const [filters, setFilters] = useState<{
    name: string;
    brand: string;
    supplier_name: string;
    id: string;
    price_gte: string;
    price_lte: string;
    only_trashed: boolean;
    with_trashed: boolean;
  }>({
    name: '',
    brand: '',
    supplier_name: '',
    id: '',
    price_gte: '',
    price_lte: '',
    only_trashed: false,
    with_trashed: false,
  });

  // Map routes to nav items
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/users': 'users',
    '/products': 'products',
  };
  const currentRoute = routeMap[pathname] || '';

  const isAnyProductLoading = useMemo(() => Object.values(productLoading).some((v) => v), [productLoading]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('paginate', '25');
    if (filters.name) params.append('name', filters.name);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.supplier_name) params.append('supplier_name', filters.supplier_name);
    if (filters.id) params.append('id', filters.id);
    if (filters.price_gte) params.append('price[gte]', filters.price_gte);
    if (filters.price_lte) params.append('price[lte]', filters.price_lte);
    if (filters.only_trashed) params.append('only_trashed', '');
    if (filters.with_trashed) params.append('with_trashed', '');
    return params.toString();
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://api.seregelagebeya.com/api/v1/categories', {
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
        console.warn('Categories fetch failed:', res.status, errorBody);
        setError('Failed to load categories');
        return;
      }

      const json = await res.json();
      setCategories(json.data);
    } catch (e) {
      console.warn('Error fetching categories:', e);
      setError('Error loading categories');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId: number, page: number = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setProductLoading((prev) => ({ ...prev, [categoryId]: true }));
    setProductError((prev) => ({ ...prev, [categoryId]: null }));

    try {
      const queryParams = buildQueryParams();
      const res = await fetch(
        `https://api.seregelagebeya.com/api/v1/categories/${categoryId}/products?page=${page}&${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        console.warn('Unauthorized access, redirecting to login');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Products fetch failed for category', categoryId, res.status, errorBody);
        setProductError((prev) => ({ ...prev, [categoryId]: 'Failed to load products' }));
        return;
      }

      const json = await res.json();
      setProductsByCategory((prev) => ({
        ...prev,
        [categoryId]: json.data
          .filter((product: any) => product.is_active === 1)
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            total_quantity: product.total_quantity,
            image_paths: product.image_paths,
            is_loan_eligible: !!product.is_loan_eligible,
          })),
      }));
      setProductMeta((prev) => ({
        ...prev,
        [categoryId]: {
          current_page: json.meta.current_page,
          last_page: json.meta.last_page,
          from: json.meta.from,
          to: json.meta.to,
          total: json.meta.total,
        },
      }));
    } catch (e) {
      console.warn('Error fetching products for category', categoryId, e);
      setProductError((prev) => ({ ...prev, [categoryId]: 'Error loading products' }));
    } finally {
      setProductLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const fetchAllProducts = async (page: number = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    setProductLoading((prev) => ({ ...prev, 0: true }));
    setProductError((prev) => ({ ...prev, 0: null }));

    try {
      const queryParams = buildQueryParams();
      const res = await fetch(`https://api.seregelagebeya.com/api/v1/products?page=${page}&${queryParams}`, {
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
        console.warn('All products fetch failed', res.status, errorBody);
        setProductError((prev) => ({ ...prev, 0: 'Failed to load products' }));
        return;
      }

      const json = await res.json();
      setProductsByCategory((prev) => ({
        ...prev,
        0: json.data
          .filter((product: any) => product.is_active === 1)
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            total_quantity: product.total_quantity,
            image_paths: product.image_paths,
            is_loan_eligible: !!product.is_loan_eligible,
          })),
      }));
      setProductMeta((prev) => ({
        ...prev,
        0: {
          current_page: json.meta.current_page,
          last_page: json.meta.last_page,
          from: json.meta.from,
          to: json.meta.to,
          total: json.meta.total,
        },
      }));
    } catch (e) {
      console.warn('Error fetching all products', e);
      setProductError((prev) => ({ ...prev, 0: 'Error loading products' }));
    } finally {
      setProductLoading((prev) => ({ ...prev, 0: false }));
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllProducts(1); // Fetch all products on initial load
  }, [router]);

  const handleCategoryClick = (categoryId: number) => {
    console.log(`Category clicked: ${categoryId}`);
    if (productLoading[categoryId]) return;
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
      if (!productsByCategory[categoryId]) {
        fetchProducts(categoryId, productPage[categoryId] || 1);
      }
    }
  };

  const handleAllProductsClick = () => {
    console.log('All Products clicked');
    if (productLoading[0]) return;
    if (selectedCategoryId === 0) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(0);
      if (!productsByCategory[0]) {
        fetchAllProducts(productPage[0] || 1);
      }
    }
  };

  const handleNavClick = (route: string) => {
    if (routeMap[pathname] !== route) {
      setNavLoading((prev) => ({ ...prev, [route]: true }));
    }
  };

  const handleRefresh = () => {
    setError(null);
    setProductsByCategory({});
    setProductMeta({});
    setProductPage({});
    setSelectedCategoryId(0); // Reset to "All Products"
    setFilters({
      name: '',
      brand: '',
      supplier_name: '',
      id: '',
      price_gte: '',
      price_lte: '',
      only_trashed: false,
      with_trashed: false,
    });
    fetchCategories();
    fetchAllProducts(1);
  };

  const handlePageChange = (categoryId: number, page: number) => {
    if (page !== productPage[categoryId] && page >= 1 && page <= (productMeta[categoryId]?.last_page || 1)) {
      setProductPage((prev) => ({ ...prev, [categoryId]: page }));
      if (categoryId === 0) {
        fetchAllProducts(page);
      } else {
        fetchProducts(categoryId, page);
      }
    }
  };

  const handleToggleEligibility = async (productId: number, categoryId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    const product = productsByCategory[categoryId]?.find((p) => p.id === productId);
    if (!product) return;

    const newEligibility = !product.is_loan_eligible ? '1' : '0';

    setToggling((prev) => ({ ...prev, [productId]: true }));

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('is_loan_eligible', newEligibility);

      const res = await fetch(`https://api.seregelagebeya.com/api/v1/products/${productId}/update-loan-eligibility`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.warn('Toggle failed for product', productId, res.status, errorBody);
        throw new Error('Failed to toggle eligibility');
      }

      // Optimistically update the loan eligibility status
      setProductsByCategory((prev) => {
        const products = [...(prev[categoryId] || [])];
        const index = products.findIndex((p) => p.id === productId);
        if (index !== -1) {
          products[index] = { ...products[index], is_loan_eligible: newEligibility === '1' };
        }
        return { ...prev, [categoryId]: products };
      });
    } catch (e) {
      console.warn('Error toggling eligibility for product', productId, e);
      // Optionally show error to user
    } finally {
      setToggling((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleApplyFilters = () => {
    setProductPage((prev) => ({ ...prev, [selectedCategoryId || 0]: 1 }));
    if (selectedCategoryId === 0) {
      fetchAllProducts(1);
    } else if (selectedCategoryId !== null) {
      fetchProducts(selectedCategoryId, 1);
    }
  };

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 p-0">
      {/* Spinner and Toggle Switch CSS */}
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
        .spinner-dark {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top: 3px solid #1e40af;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          background-color: #ccc;
          border-radius: 12px;
          transition: background-color 0.3s;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          border-radius: 12px;
          transition: background-color 0.3s;
        }
        .slider:before {
          position: absolute;
          content: '';
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        input:checked + .slider {
          background-color: #1e40af;
        }
        input:checked + .slider:before {
          transform: translateX(24px);
        }
        input:disabled + .slider {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-6 mx-4 sm:mx-6">
        <ul className="flex space-x-4 sm:space-x-6 justify-center items-center">
          <li>
            <Link
              href="/"
              onClick={() => handleNavClick('loans')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.loans
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'loans'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'loans' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.loans && currentRoute !== 'loans' ? (
                <>
                  <span className="spinner mr-2" />
                  Loans
                </>
              ) : (
                'Loans'
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/users"
              onClick={() => handleNavClick('users')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.users
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'users'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'users' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.users && currentRoute !== 'users' ? (
                <>
                  <span className="spinner mr-2" />
                  Loan Users
                </>
              ) : (
                'Loan Users'
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              onClick={() => handleNavClick('products')}
              className={`relative flex items-center px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                navLoading.products
                  ? 'bg-blue-900 cursor-not-allowed'
                  : currentRoute === 'products'
                  ? 'bg-blue-900 text-white cursor-not-allowed underline'
                  : 'bg-blue-700 hover:bg-blue-500 hover:shadow-md active:bg-blue-900'
              }`}
              style={currentRoute === 'products' ? { pointerEvents: 'none' } : {}}
            >
              {navLoading.products && currentRoute !== 'products' ? (
                <>
                  <span className="spinner mr-2" />
                  Products
                </>
              ) : (
                'Products'
              )}
            </Link>
          </li>
        </ul>
      </nav>

      <header className="mb-6 py-4 border-b border-blue-200 mx-4 sm:mx-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">Products Dashboard</h1>
      </header>

      {/* Filter Section */}
      <div className="mb-6 mx-4 sm:mx-6">
        <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Filter Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700">Name</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Apple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Brand</label>
              <input
                type="text"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., coca"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Supplier Name</label>
              <input
                type="text"
                name="supplier_name"
                value={filters.supplier_name}
                onChange={handleFilterChange}
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., fresh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Product ID</label>
              <input
                type="text"
                name="id"
                value={filters.id}
                onChange={handleFilterChange}
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Min Price</label>
              <input
                type="number"
                name="price_gte"
                value={filters.price_gte}
                onChange={handleFilterChange}
                min="0"
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Max Price</label>
              <input
                type="number"
                name="price_lte"
                value={filters.price_lte}
                onChange={handleFilterChange}
                min="0"
                className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1000000"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm font-medium text-blue-700">
                <input
                  type="checkbox"
                  name="only_trashed"
                  checked={filters.only_trashed}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                Only Trashed
              </label>
              <label className="flex items-center text-sm font-medium text-blue-700">
                <input
                  type="checkbox"
                  name="with_trashed"
                  checked={filters.with_trashed}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                With Trashed
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleApplyFilters}
              disabled={isAnyProductLoading}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAnyProductLoading
                  ? 'bg-blue-900 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAnyProductLoading ? (
                <>
                  <span className="spinner mr-2" />
                  Applying...
                </>
              ) : (
                'Apply Filters'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end mx-4 sm:mx-6">
        <button
          onClick={handleRefresh}
          disabled={loading || isAnyProductLoading}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            loading || isAnyProductLoading
              ? 'bg-blue-900 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading || isAnyProductLoading ? (
            <>
              <span className="spinner mr-2" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-blue-600 py-8 mx-4 sm:mx-6">Loading categories...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8 mx-4 sm:mx-6">{error}</div>
      ) : (
        <div className="w-full px-4 sm:px-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            <AnimatePresence>
              <motion.button
                key="all-products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`bg-blue-600 text-white px-3 py-2 rounded-lg shadow border border-blue-300 transition-all duration-300 flex flex-col items-center justify-center ${
                  selectedCategoryId === 0 ? 'bg-blue-800 shadow-lg ring-2 ring-blue-400' : ''
                } ${productLoading[0] ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-blue-700'}`}
                disabled={productLoading[0]}
                onClick={handleAllProductsClick}
              >
                {productLoading[0] ? (
                  <span className="spinner mb-2" />
                ) : null}
                <h2 className="text-lg font-semibold truncate">All Products</h2>
                <p className="text-xs">View All</p>
              </motion.button>
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white px-3 py-2 rounded-lg shadow border border-blue-100 transition-all duration-300 flex flex-col items-center justify-center ${
                    selectedCategoryId === category.id ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                  } ${productLoading[category.id] ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-blue-50'}`}
                  disabled={productLoading[category.id]}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {productLoading[category.id] ? (
                    <span className="spinner-dark mb-2" />
                  ) : null}
                  <h2 className="text-base font-semibold text-blue-900 truncate">{category.name}</h2>
                  <p className="text-xs text-blue-600">Products: {category.products_count}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {selectedCategoryId !== null && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                {selectedCategoryId === 0
                  ? 'All Products'
                  : `Products in ${categories.find((c) => c.id === selectedCategoryId)?.name}`}
              </h2>
              {productLoading[selectedCategoryId] ? (
                <div className="text-center text-blue-600 py-4">Loading products...</div>
              ) : productError[selectedCategoryId] ? (
                <div className="text-center text-red-600 py-4">{productError[selectedCategoryId]}</div>
              ) : !productsByCategory[selectedCategoryId] || productsByCategory[selectedCategoryId].length === 0 ? (
                <div className="text-center text-blue-600 py-4">No active products found.</div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    <AnimatePresence>
                      {productsByCategory[selectedCategoryId].map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white p-4 rounded-lg shadow border border-blue-100 flex items-center gap-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 sm:flex-row flex-col"
                        >
                          {product.image_paths[0] ? (
                            <img
                              src={product.image_paths[0]}
                              alt={product.name}
                              className="w-32 h-32 object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.png'; // Fallback image
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-blue-900">{product.name}</h3>
                              <p className="text-sm text-blue-600">Price: {product.price} ETB</p>
                              <p className="text-sm text-blue-600">In Stock: {product.total_quantity}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm text-blue-600">
                                Loan Eligible: {product.is_loan_eligible ? 'Yes' : 'No'}
                              </p>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={product.is_loan_eligible}
                                  disabled={toggling[product.id]}
                                  onChange={() => handleToggleEligibility(product.id, selectedCategoryId)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {productMeta[selectedCategoryId] && (
                    <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handlePageChange(selectedCategoryId, 1)}
                        disabled={productMeta[selectedCategoryId].current_page === 1}
                        className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        First
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(selectedCategoryId, productMeta[selectedCategoryId].current_page - 1)
                        }
                        disabled={productMeta[selectedCategoryId].current_page === 1}
                        className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        Prev
                      </button>
                      {[...Array(productMeta[selectedCategoryId].last_page).keys()]
                        .filter(
                          (num) =>
                            Math.abs(num + 1 - productMeta[selectedCategoryId].current_page) <= 2 ||
                            num === 0 ||
                            num === productMeta[selectedCategoryId].last_page - 1
                        )
                        .map((num) => (
                          <button
                            key={num + 1}
                            onClick={() => handlePageChange(selectedCategoryId, num + 1)}
                            className={`px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors ${
                              num + 1 === productMeta[selectedCategoryId].current_page
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100'
                            }`}
                          >
                            {num + 1}
                          </button>
                        ))}
                      <button
                        onClick={() =>
                          handlePageChange(selectedCategoryId, productMeta[selectedCategoryId].current_page + 1)
                        }
                        disabled={
                          productMeta[selectedCategoryId].current_page === productMeta[selectedCategoryId].last_page
                        }
                        className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => handlePageChange(selectedCategoryId, productMeta[selectedCategoryId].last_page)}
                        disabled={
                          productMeta[selectedCategoryId].current_page === productMeta[selectedCategoryId].last_page
                        }
                        className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        Last
                      </button>
                    </div>
                  )}
                </>
              )}
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