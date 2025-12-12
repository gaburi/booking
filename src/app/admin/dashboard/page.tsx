'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalBookings: number;
  upcomingSessions: number;
  revenue: number;
}

interface RecentBooking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  type: string;
  status: string;
  createdAt: string;
  totalAmount: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingSessions: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [currentPrice, setCurrentPrice] = useState<string>('49.99');
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const NATIVE_LANGUAGES = ['pt', 'fr', 'es', 'it'];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData(token);
    loadSettings(token);
  }, [router]);

  const loadDashboardData = async (token: string) => {
    try {
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }

      const bookingsResponse = await fetch('/api/admin/bookings/recent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsResponse.ok) {
        setRecentBookings(await bookingsResponse.json());
      }
    } catch (err) {
      console.error('Data load error', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (token: string) => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.SESSION_PRICE_CENTS) {
          setCurrentPrice((parseInt(data.SESSION_PRICE_CENTS) / 100).toFixed(2));
        }
      }
    } catch (err) {
      console.error('Settings load error', err);
    }
  };

  const handleUpdatePrice = async () => {
    setSavingPrice(true);
    setPriceMessage('');
    try {
      const priceInCents = Math.round(parseFloat(currentPrice) * 100);
      const token = localStorage.getItem('authToken');

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          key: 'SESSION_PRICE_CENTS',
          value: priceInCents.toString(),
          description: 'Session price in cents'
        })
      });

      if (res.ok) {
        setPriceMessage('Price updated successfully!');
        setTimeout(() => setPriceMessage(''), 3000);
      } else {
        setPriceMessage('Failed to update price.');
      }
    } catch (err) {
      setPriceMessage('Error updating price.');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/admin');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sendEmail = (booking: RecentBooking, type: 'cancel' | 'update' | 'general') => {
    // For now, use mailto
    const subject = type === 'cancel' ? 'Session Cancellation' : type === 'update' ? 'Session Update' : 'Information about your session';
    const body = `Hi ${booking.firstName},\n\n`;
    window.location.href = `mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Toggle menu handler
  const toggleMenu = (id: string) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will refund the customer (if applicable) and notify them.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Admin cancelled from dashboard' })
      });

      if (res.ok) {
        alert('Booking cancelled successfully.');
        // Refresh data
        loadDashboardData(localStorage.getItem('authToken') || '');
      } else {
        const data = await res.json();
        alert('Failed to cancel: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error cancelling booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brilance Admin</h1>
              <p className="text-sm text-gray-600 mt-1">Hello, {user?.name || user?.email}</p>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingSessions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/availability" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                <p className="text-sm text-gray-500">Manage calendar slots</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/locations" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-teal-100 rounded-lg text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
                <p className="text-sm text-gray-500">Manage session venues</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/coupons" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-lg text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Coupons</h3>
                <p className="text-sm text-gray-500">Discounts & Promos</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings/emails" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                <p className="text-sm text-gray-500">Customize notifications</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h2>
          <div className="flex items-end gap-4 max-w-sm">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Price (EUR)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="49.99"
                />
              </div>
            </div>
            <button
              onClick={handleUpdatePrice}
              disabled={savingPrice}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {savingPrice ? 'Saving...' : 'Update Price'}
            </button>
          </div>
          {priceMessage && <p className="mt-2 text-sm text-green-600">{priceMessage}</p>}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View All &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No bookings yet</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => {
                    const needsTranslator = !NATIVE_LANGUAGES.includes(booking.language.toLowerCase());
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors relative">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.firstName} {booking.lastName}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                          <div className="text-xs text-gray-400">{booking.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{booking.type}</div>
                          <div className="text-sm text-gray-500">{formatDate(booking.createdAt)}</div>
                          <div className="text-sm font-semibold text-indigo-600">{formatCurrency(booking.totalAmount)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="uppercase text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {booking.language}
                            </span>
                            {needsTranslator && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                Translator Needed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {/* ACTIONS DROPDOWN */}
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(booking.id)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                            >
                              Actions
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {openMenuId === booking.id && (
                              <>
                                {/* Backdrop to close */}
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>

                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                  <button
                                    onClick={() => { sendEmail(booking, 'general'); setOpenMenuId(null); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Send Email
                                  </button>
                                  <button
                                    onClick={() => { handleCancelBooking(booking.id); setOpenMenuId(null); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Cancel Booking (System)
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
