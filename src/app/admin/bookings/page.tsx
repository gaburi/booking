'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
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

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const NATIVE_LANGUAGES = ['pt', 'fr', 'es', 'it'];

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/admin');
            return;
        }
        loadBookings(token);
    }, [router]);

    const loadBookings = async (token: string) => {
        try {
            // Reusing the simple text search or just fetching all for now.
            // The API currently supports ?email=... but we might want all.
            // We need an endpoint for ALL bookings.
            // The current /api/admin/bookings/recent returns top 5.
            // We need /api/admin/bookings (new endpoint) or modify `recent` to accept limit.

            // Let's assume we create /api/admin/bookings/list
            const res = await fetch('/api/admin/bookings/list', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch bookings');

            const data = await res.json();
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount / 100);
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

    const sendEmail = (booking: Booking, type: 'cancel' | 'update' | 'general') => {
        const subject = type === 'cancel' ? 'Session Cancellation' : type === 'update' ? 'Session Update' : 'Information about your session';
        const body = `Hi ${booking.firstName},\n\n`;
        window.location.href = `mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
                            &larr; Back
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                                {bookings.map((booking) => {
                                    const needsTranslator = !NATIVE_LANGUAGES.includes(booking.language.toLowerCase());
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
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
                                                <div className="flex space-x-2">
                                                    <div className="relative group">
                                                        <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors">
                                                            Actions
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-gray-200">
                                                            <button onClick={() => sendEmail(booking, 'general')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Send Email</button>
                                                            <button onClick={() => sendEmail(booking, 'update')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Reschedule Email</button>
                                                            <button onClick={() => sendEmail(booking, 'cancel')} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cancel & Email</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
