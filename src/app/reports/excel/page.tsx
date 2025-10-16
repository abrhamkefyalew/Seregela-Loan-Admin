'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '../../components/NavigationBar';

export default function ReportsExcel() {
  const router = useRouter();
  
  // Search Filters
  const [userId, setUserId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loanId, setLoanId] = useState('');
  const [loanUserId, setLoanUserId] = useState('');
  const [loanTransactionId, setLoanTransactionId] = useState('');
  
  // Transaction Filters (boolean - presence matters, not value)
  const [isOverdue, setIsOverdue] = useState(false);
  const [unpaid, setUnpaid] = useState(false);
  const [paid, setPaid] = useState(false);
  const [take, setTake] = useState(false);
  const [repayment, setRepayment] = useState(false);
  const [purchase, setPurchase] = useState(false);
//   const [purchaseUnpaid, setPurchaseUnpaid] = useState(false);
//   const [purchasePendingPickup, setPurchasePendingPickup] = useState(false);
  
  // Report Type Selection
  const [reportType, setReportType] = useState('');
  const [downloading, setDownloading] = useState(false);
  
  // Route map for NavigationBar
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
    '/products': 'products',
    '/users': 'users',
    '/overdue_loans': 'overdue_loans',
    '/reports/excel': 'reports',
  };
  const currentRoute = 'reports';

  // Nav loading state
  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
    users: false,
    overdue_loans: false,
    reports: false,
  });

  const handleDownload = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first');
      router.push('/login');
      return;
    }

    setDownloading(true);

    try {
      // Build URL with filters - EXACTLY matching your Postman request
      let url = 'https://api.seregelagebeya.com/api/v1/loans/generate-report-excel?';

      // Specific ID filters (with values)
      if (userId) url += `user_id=${encodeURIComponent(userId)}&`;
      if (phoneNumber) url += `phone_number=${encodeURIComponent(phoneNumber)}&`;
      if (loanId) url += `loan_id=${encodeURIComponent(loanId)}&`;
      if (loanUserId) url += `loan_user_id=${encodeURIComponent(loanUserId)}&`;
      if (loanTransactionId) url += `loan_transaction_id=${encodeURIComponent(loanTransactionId)}&`;

      // Report Type (with empty value as per your backend) FIXED - ONLY IF SELECTED
      if (reportType) url += `${reportType}=&`;

      // Transaction Filters (PRESENT without value - as checkboxes)
      if (isOverdue) url += `is_overdue=&`;
      if (unpaid) url += `unpaid=&`;
      if (paid) url += `paid=&`;
      if (take) url += `take&`;  // No =, just presence
      if (repayment) url += `repayment&`;
      if (purchase) url += `purchase&`;
    //   if (purchaseUnpaid) url += `purchase_unpaid=&`;
    //   if (purchasePendingPickup) url += `purchase_pending_pickup=&`;

      // Clean up trailing & or ?
      url = url.replace(/&$/, '');

      console.log('📥 Download URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Get filename from headers or default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'loan_report.xlsx';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1];
          }
        }

        // Convert to blob and trigger download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        alert('Excel report downloaded successfully!');
      } else {
        const errorText = await response.text();
        console.warn('Download failed:', response.status, errorText);
        
        // FIXED: CLEAN MESSAGE + 401 REDIRECT
        let errorMessage = 'Failed to download report';
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          alert('Session expired. Redirecting to login...');
          router.push('/login');
          return;
        }
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText.trim();
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.warn('Download error:', error);
      alert('Error downloading report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleClearFilters = () => {
    setUserId('');
    setPhoneNumber('');
    setLoanId('');
    setLoanUserId('');
    setLoanTransactionId('');
    setIsOverdue(false);
    setUnpaid(false);
    setPaid(false);
    setTake(false);
    setRepayment(false);
    setPurchase(false);
    setReportType(''); // Clear report type too
    // setPurchaseUnpaid(false);
    // setPurchasePendingPickup(false);
  };

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 p-4 sm:p-6">
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
          to { transform: rotate(360deg); }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">📊 Loan Reports - Excel Download</h1>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Report Type Selection */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">📋 Select Report Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                { value: 'users_individual_multi_sheet', label: '👥 Multi-Sheet (Users)', desc: 'Individual sheets per user' },
                { value: 'users_based_single_sheet', label: '📄 Single Sheet (Users)', desc: 'All users in one sheet' },
                { value: 'transactions_based_single_sheet', label: '💳 Single Sheet (Transactions)', desc: 'All transactions in one sheet' },
                ].map(({ value, label, desc }) => (
                <label key={value} className="flex items-center p-3 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50">
                    <input
                    type="checkbox"
                    checked={reportType === value}
                    onChange={(e) => {
                        if (e.target.checked) {
                        setReportType(value);
                        } else {
                        setReportType('');
                        }
                    }}
                    className="mr-3 text-blue-600"
                    />
                    <div>
                    <div className="font-medium text-blue-900">{label}</div>
                    <div className="text-sm text-blue-600">{desc}</div>
                    </div>
                </label>
                ))}
            </div>
        </div>

        {/* Filters Form */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">🔍 Filters</h2>
          
          {/* Specific ID Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2640"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="251910903898"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Loan ID</label>
              <input
                type="text"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Loan User ID</label>
              <input
                type="text"
                value={loanUserId}
                onChange={(e) => setLoanUserId(e.target.value)}
                className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Transaction ID</label>
              <input
                type="text"
                value={loanTransactionId}
                onChange={(e) => setLoanTransactionId(e.target.value)}
                className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9"
              />
            </div>
          </div>

          {/* Transaction Filters */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-blue-900 mb-3">💸 Transaction Filters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {[
                { key: 'isOverdue', label: 'Overdue', state: isOverdue, setter: setIsOverdue },
                { key: 'unpaid', label: 'Unpaid', state: unpaid, setter: setUnpaid },
                { key: 'paid', label: 'Paid', state: paid, setter: setPaid },
                { key: 'take', label: 'Take', state: take, setter: setTake },
                { key: 'repayment', label: 'Repayment', state: repayment, setter: setRepayment },
                { key: 'purchase', label: 'Purchase', state: purchase, setter: setPurchase },
                // { key: 'purchaseUnpaid', label: 'Purchase Unpaid', state: purchaseUnpaid, setter: setPurchaseUnpaid },
                // { key: 'purchasePendingPickup', label: 'Pending Pickup', state: purchasePendingPickup, setter: setPurchasePendingPickup },
              ].map(({ key, label, state, setter }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={(e) => setter(e.target.checked)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-blue-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-2 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex items-center justify-center px-8 py-2 rounded-lg font-medium transition-colors ${
                downloading
                  ? 'bg-blue-900 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {downloading ? (
                <>
                  <span className="spinner mr-2" />
                  Downloading...
                </>
              ) : (
                '📥 Download Excel'
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How to Use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Fill specific IDs (User/Loan/etc.) OR leave blank for all records</li>
            <li>• Check transaction filters as needed</li>
            <li>• Select report type OR leave blank for default</li>
            <li>• Click "Download Excel" - file will auto-download</li>
            <li>• Multi-sheet: One sheet per user | Single-sheet: All in one tab</li>
          </ul>
        </div>
      </div>

      <footer className="mt-10 pt-6 border-t border-blue-200 text-center text-sm text-blue-600">
        © 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}