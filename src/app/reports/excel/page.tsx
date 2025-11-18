'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '../../components/NavigationBar';

export default function ReportsExcel() {
  const router = useRouter();

  // ==================== ORIGINAL REPORT STATES ====================
  const [userId, setUserId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loanId, setLoanId] = useState('');
  const [loanUserId, setLoanUserId] = useState('');
  const [loanTransactionId, setLoanTransactionId] = useState('');

  const [isOverdue, setIsOverdue] = useState(false);
  const [unpaid, setUnpaid] = useState(false);
  const [paid, setPaid] = useState(false);
  const [take, setTake] = useState(false);
  const [repayment, setRepayment] = useState(false);
  const [purchase, setPurchase] = useState(false);

  const [reportType, setReportType] = useState('');
  const [downloading, setDownloading] = useState(false);

  // ==================== LOAN-ONLY REPORT STATES ====================
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireEmail, setRequireEmail] = useState(false);
  const [requireFirstName, setRequireFirstName] = useState(false);
  const [requireLastName, setRequireLastName] = useState(false);

  // New: Multi-select status using checkboxes
  const [notApproved, setNotApproved] = useState(false);
  const [paymentNotCompleted, setPaymentNotCompleted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadingLoanOnly, setDownloadingLoanOnly] = useState(false);

  // Navigation
  const routeMap: { [key: string]: string } = {
    '/': 'loans',
    '/loan_users': 'loan_users',
    '/products': 'products',
    '/users': 'users',
    '/overdue_loans': 'overdue_loans',
    '/reports/excel': 'reports',
  };
  const currentRoute = 'reports';

  const [navLoading, setNavLoading] = useState<{ [key: string]: boolean }>({
    loans: false,
    loan_users: false,
    products: false,
    users: false,
    overdue_loans: false,
    reports: false,
  });

  // ==================== ORIGINAL DOWNLOAD HANDLER ====================
  const handleDownload = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first');
      router.push('/login');
      return;
    }

    setDownloading(true);

    try {
      let url = 'https://api.seregelagebeya.com/api/v1/loans/generate-report-excel?';

      if (userId) url += `user_id=${encodeURIComponent(userId)}&`;
      if (phoneNumber) url += `phone_number=${encodeURIComponent(phoneNumber)}&`;
      if (loanId) url += `loan_id=${encodeURIComponent(loanId)}&`;
      if (loanUserId) url += `loan_user_id=${encodeURIComponent(loanUserId)}&`;
      if (loanTransactionId) url += `loan_transaction_id=${encodeURIComponent(loanTransactionId)}&`;

      if (reportType) url += `${reportType}=&`;

      if (isOverdue) url += `is_overdue=&`;
      if (unpaid) url += `unpaid=&`;
      if (paid) url += `paid=&`;
      if (take) url += `take&`;
      if (repayment) url += `repayment&`;
      if (purchase) url += `purchase&`;

      url = url.replace(/&$/, '');
      console.log('Original Report URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'loan_report.xlsx';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match?.[1]) filename = match[1];
        }

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
        await handleErrorResponse(response);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ==================== LOAN-ONLY DOWNLOAD HANDLER ====================
  const handleDownloadLoanOnly = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first');
      router.push('/login');
      return;
    }

    setDownloadingLoanOnly(true);

    try {
      let url = 'https://api.seregelagebeya.com/api/v1/loans/generate-report-excel-loan-only?';

      // Required fields
      if (requirePhone) url += 'require_phone=1&';
      if (requireEmail) url += 'require_email=1&';
      if (requireFirstName) url += 'require_first_name=1&';
      if (requireLastName) url += 'require_last_name=1&';

      // Multiple status support
      if (notApproved) url += 'status=NOT_APPROVED&';
      if (paymentNotCompleted) url += 'status=PAYMENT_NOT_COMPLETED&';
      if (paymentCompleted) url += 'status=PAYMENT_COMPLETED&';

      // Date range
      if (startDate) url += `start_date=${startDate}&`;
      if (endDate) url += `end_date=${endDate}&`;

      url = url.replace(/&$/, '');
      console.log('Loan-Only Report URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'loan_only_report.xlsx';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match?.[1]) filename = match[1];
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        alert('Loan-Only Excel report downloaded successfully!');
      } else {
        await handleErrorResponse(response);
      }
    } catch (error) {
      console.error('Loan-only download error:', error);
      alert('Error downloading loan-only report.');
    } finally {
      setDownloadingLoanOnly(false);
    }
  };

  // Shared error handler
  const handleErrorResponse = async (response: Response) => {
    const errorText = await response.text();
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
      errorMessage = errorText.trim() || errorMessage;
    }
    alert(errorMessage);
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
    setReportType('');
  };

  const handleClearLoanOnlyFilters = () => {
    setRequirePhone(true);
    setRequireEmail(true);
    setRequireFirstName(true);
    setRequireLastName(true);
    setNotApproved(false);
    setPaymentNotCompleted(false);
    setPaymentCompleted(false);
    setStartDate('');
    setEndDate('');
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

      <NavigationBar
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        currentRoute={currentRoute}
        routeMap={routeMap}
      />

      <header className="mb-6 py-4 border-b border-blue-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">
          Loan Reports - Excel Download
        </h1>
      </header>

      <div className="max-w-6xl mx-auto space-y-10">

        {/* ==================== ORIGINAL GENERAL REPORT ==================== */}
        <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-6">General Loan & Transaction Report</h2>

          {/* Report Type */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'users_individual_multi_sheet', label: 'Multi-Sheet (Users)', desc: 'Individual sheets per user' },
                { value: 'users_based_single_sheet', label: 'Single Sheet (Users)', desc: 'All users in one sheet' },
                { value: 'transactions_based_single_sheet', label: 'Single Sheet (Transactions)', desc: 'All transactions in one sheet' },
              ].map(({ value, label, desc }) => (
                <label key={value} className="flex items-center p-3 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={reportType === value}
                    onChange={(e) => setReportType(e.target.checked ? value : '')}
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

          {/* ID Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Loan ID" value={loanId} onChange={(e) => setLoanId(e.target.value)} className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Loan User ID" value={loanUserId} onChange={(e) => setLoanUserId(e.target.value)} className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Transaction ID" value={loanTransactionId} onChange={(e) => setLoanTransactionId(e.target.value)} className="w-full bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Transaction Filters */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-blue-900 mb-3">Transaction Filters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {[
                { label: 'Overdue', setter: setIsOverdue },
                { label: 'Unpaid', setter: setUnpaid },
                { label: 'Paid', setter: setPaid },
                { label: 'Take', setter: setTake },
                { label: 'Repayment', setter: setRepayment },
                { label: 'Purchase', setter: setPurchase },
              ].map(({ label, setter }) => (
                <label key={label} className="flex items-center">
                  <input type="checkbox" onChange={(e) => setter(e.target.checked)} className="mr-2 text-blue-600" />
                  <span className="text-sm text-blue-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button onClick={handleClearFilters} className="px-6 py-2 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg font-medium transition-colors">
              Clear All
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex items-center justify-center px-8 py-2 rounded-lg font-medium transition-colors ${
                downloading ? 'bg-blue-900 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {downloading ? (
                <>
                  <span className="spinner mr-2" />
                  Downloading...
                </>
              ) : (
                'Download Excel'
              )}
            </button>
          </div>
        </div>

        {/* ==================== LOAN-ONLY REPORT SECTION ==================== */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-lg border border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-6">Loan-Only Report</h2>
          <p className="text-sm text-purple-700 mb-6">
            Download loans with flexible status filtering and required user fields.
          </p>

          {/* Require Fields */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-purple-800 mb-3">Require User Fields</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Phone Number', state: requirePhone, setter: setRequirePhone },
                { label: 'Email', state: requireEmail, setter: setRequireEmail },
                { label: 'First Name', state: requireFirstName, setter: setRequireFirstName },
                { label: 'Last Name', state: requireLastName, setter: setRequireLastName },
              ].map(({ label, state, setter }) => (
                <label key={label} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={(e) => setter(e.target.checked)}
                    className="mr-2 text-purple-600"
                  />
                  <span className="text-sm text-purple-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filters - Grouped & Multi-Select */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-purple-800 mb-3">Loan Status (Optional - Select Any)</h3>
            <div className="space-y-4">
              {/* Not Approved */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notApproved}
                    onChange={(e) => setNotApproved(e.target.checked)}
                    className="mr-3 text-purple-600 w-5 h-5"
                  />
                  <span className="text-purple-900 font-medium">Not Approved</span>
                </label>
              </div>

              {/* Approved Loans Group */}
              <div className="ml-6 pl-6 border-l-4 border-purple-300">
                <p className="text-sm font-semibold text-purple-800 mb-2">Approved Loans</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentNotCompleted}
                      onChange={(e) => setPaymentNotCompleted(e.target.checked)}
                      className="mr-3 text-purple-600"
                    />
                    <span className="text-purple-700">Payment Not Completed</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentCompleted}
                      onChange={(e) => setPaymentCompleted(e.target.checked)}
                      className="mr-3 text-purple-600"
                    />
                    <span className="text-purple-700">Payment Completed</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleClearLoanOnlyFilters}
              className="px-6 py-2 bg-purple-200 hover:bg-purple-300 text-purple-900 rounded-lg font-medium transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={handleDownloadLoanOnly}
              disabled={downloadingLoanOnly}
              className={`flex items-center justify-center px-8 py-2 rounded-lg font-medium transition-colors ${
                downloadingLoanOnly
                  ? 'bg-purple-900 text-white cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {downloadingLoanOnly ? (
                <>
                  <span className="spinner mr-2" />
                  Downloading...
                </>
              ) : (
                'Download Loan-Only Report'
              )}
            </button>
          </div>
        </div>

        

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ How to Use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Top section: Full flexible reports (users, transactions, etc.)</li>
            <li>• Purple section: Focused report for loans Only (with their corresponding customers)</li>
            <li>• Both sections are completely independent</li>
          </ul>
          {/* Instructions */}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Top Section</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Fill specific IDs (User/Loan/etc.) OR leave blank for all records</li>
              <li>• Check transaction filters as needed</li>
              <li>• Select report type OR leave blank for default</li>
              <li>• Click "Download Excel" - file will auto-download</li>
              <li>• Multi-sheet: One sheet per user | Single-sheet: All in one tab</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Bottom Section</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You can use any combination of the checkboxes</li>
              <li>• Date filter included for loan</li>
            </ul>
          </div>

          

        </div>
      </div>

      <footer className="mt-10 pt-6 border-t border-blue-200 text-center text-sm text-blue-600">
        © 2025 Seregela. All rights reserved.
      </footer>
    </main>
  );
}