// src/app/page.tsx


'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// import { metrics } from '@/data/metrics'; // REMOVE UNUSED IMPORT




// 
// Create a separate component for the time display
const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div className="text-gray-600 text-sm">🕒 {currentTime}</div>;
};




// Inside page.tsx (Option 1)
interface Metric {
  label: string;
  value: number;
  change: number;
  unit?: string;
  lastMonthValue?: number;
  lastMonthRange?: string; // formatted as (e.g., "Jul 1 – Jul 31")
}


export default function Home() {

  
  // Replace the any[] with Metric[]
  const router = useRouter();


  const handleGoToDetailCustomersPageFilter = () => {
    router.push('/detailCustomers');
  };



  // FOR LOADING STATE
  const [loading, setLoading] = useState(false);  
  


  // 2. Then callback functions
  const fetchUsersData = useCallback(async (token: string) => {
    // FOR LOADING STATE
    setLoading(true); // Start loading
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/loan-customers`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

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
        console.warn('Fetch failed:', res.status, errorBody);
        router.push('/login');
        return;
      }
      
      const response = await res.json();
      const data = response.data;

      


      





    } catch (err) {
      console.warn(err);
      router.push('/login');
    } finally {
     
      // FOR LOADING STATE
      setLoading(false); // Stop loading in all cases
    }
  }, [router]);


  // 3. Then effects
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token || typeof token !== 'string') {
      console.warn('Invalid or missing token');
      router.push('/login');
      return;
    }

    fetchUsersData(token);

  }, [fetchUsersData, router]); // <- both are dependencies here



  // refresh page // rerender page
  const handleRefresh = () => {
  const token = localStorage.getItem('authToken');
  if (token && typeof token === 'string') {
      fetchUsersData(token);
    } else {
      router.push('/login');
    }
  };



  // const exportMetricsToCSV = () => {
  //   const headers = ['Label', 'Value', 'Change', 'Last Month', 'Date Range', 'Unit'];
  //   const rows = metrics.map(metric => [
  //     metric.label,
  //     metric.value,
  //     metric.change,
  //     metric.lastMonthValue ?? '',
  //     metric.lastMonthRange ?? '',
  //     metric.unit ?? '',
  //   ]);

  //   const csvContent =
  //     [headers, ...rows]
  //       .map(row => row.map(field => `"${field}"`).join(','))
  //       .join('\n');

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);

  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.setAttribute('download', 'dashboard_report.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };



  




  return (
    <main className="min-h-screen bg-white flex justify-center p-4">
      <div className="w-full max-w-[95vw] bg-[#EEF7FF] rounded-3xl transition-shadow duration-300 hover:shadow-2xl">
        {/* Header */}
        <header className="w-full bg-white p-6 shadow-sm flex justify-between items-center flex-wrap gap-4 rounded-t-3xl">
          <h1 className="text-2xl font-bold text-black">
            Seregela Users Management Hub{' '}
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm ml-2">Live</span>
          </h1>
          <div className="flex items-center gap-4">

          <TimeDisplay />

          <button
            onClick={handleRefresh}
            disabled={loading} // FOR LOADING STATE
                className={`px-4 py-2 rounded-md transition text-white ${
                    loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                >

                {/* // FOR LOADING STATE */}
                {/* NORMAL LOADING */}
                {/* {loading ? 'Refreshing...' : 'Refresh Data'} */}


                {/* // FOR LOADING STATE */}
                {/* LOADING USING SPINNER */}
                {loading ? (
                    <span className="flex items-center gap-2">
                    <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                    >
                        <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        />
                        <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    Refreshing...
                    </span>
                ) : (
                    'Refresh Data'
                )}
          </button>          

          {/* <button
            onClick={exportMetricsToCSV}
            className="bg-white border border-gray-300 px-4 py-2 rounded-md hover:shadow text-black transition-shadow"
          >
            Export Report
          </button> */}


          {/* <div className="p-8">
            <button
              onClick={handleGoToDateFilter}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              <span role="img" aria-label="calendar">📅</span>
              More
            </button>
          </div> */}


          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              router.push('/login');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        </header>

        <div className="p-6 rounded-b-3xl">
          <section className="mb-4 max-w-full">
            <h2 className="text-xl font-semibold text-black">Loan Management Dashboard</h2>
            <p className="text-gray-600">
              Loan Management Dashboard
            </p>
          </section>

          
        </div>
      </div>
    </main>
  );
}