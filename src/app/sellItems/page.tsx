// app/sell-items/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/context/AuthContext'; // Import your auth context
import ItemForm from '@/app/_components/ItemForm'; // Import your item form component

// Loading component
function LoadingForm() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-36 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function SellItemPage() {
  const { isLoading, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (!isLoading) {
      setPageLoading(false);
      
      // Redirect if not logged in
      if (!isLoggedIn) {
        router.push('/login');
      }
    }
  }, [isLoading, isLoggedIn, router]);

  // Show loading state when checking auth
  if (pageLoading || isLoading) {
    return <LoadingForm />;
  }

  // Show error message if not logged in (handles the case before redirect)
  if (!isLoggedIn || !user) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-red-500">You must be logged in to sell items</p>
        <a 
          href="/login" 
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sell Your Items</h1>
      <p className="mb-6 text-gray-600">
        List your books, stationery, or uniforms for sale. Fill out the details below
        to get started.
      </p>
      <ItemForm userId={parseInt(user.id)} />
    </div>
  );
}