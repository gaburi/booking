'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CancellationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchBooking();
    }, [params.id]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/bookings/${params.id}`);
            if (!res.ok) throw new Error('Booking not found');
            const data = await res.json();
            setBooking(data);
        } catch (err) {
            setError('Could not load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        if (!confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
            return;
        }

        setCancelling(true);
        try {
            const res = await fetch(`/api/bookings/${params.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to cancel booking');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h2>
                    <p className="text-gray-600 mb-6">
                        Your session has been successfully cancelled. A confirmation email has been sent to {booking?.email}.
                    </p>
                    {booking?.status !== 'PENDING_PAYMENT' && (
                        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded mb-6">
                            If you are eligible for a refund according to our policy (24h+ notice), it will be processed shortly.
                        </p>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                {error && (
                    <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Cancel Session</h1>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900">Session Details</h3>
                        <p className="text-gray-600 mt-1">{new Date(booking?.slot?.date).toLocaleDateString()} at {booking?.slot?.time}</p>
                        <p className="text-gray-600">{booking?.type} Session</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={3}
                            placeholder="Please tell us why you are cancelling..."
                        />
                    </div>

                    <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-100">
                        <span className="font-semibold">Cancellation Policy:</span> Cancellations made more than 24 hours before the session are fully refundable. Late cancellations may not be eligible for a refund.
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        disabled={cancelling}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
}
