'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import Navbar from '@/components/Navbar';
import { useTranslation } from 'react-i18next';
import CheckoutForm from '@/components/CheckoutForm';
import MockPaymentForm from '@/components/MockPaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentPage() {
    const { t, i18n } = useTranslation();
    const params = useParams();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [booking, setBooking] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            // Fetch Booking
            fetch(`/api/bookings/${params.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch booking');
                    return res.json();
                })
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    setBooking(data);
                })
                .catch(err => {
                    console.error(err);
                    setError(err.message);
                });

            // Create Payment Intent
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: params.id }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) throw new Error(data.error);
                    setClientSecret(data.clientSecret)
                })
                .catch((err) => setError(t('booking:payment_init_error') + ': ' + err.message));
        }
    }, [params.id]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#7c3aed',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <Navbar />
                <div className="container mx-auto py-20 text-center text-red-600">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8 md:py-12">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle suppressHydrationWarning>{t('booking:pay_securely')}</CardTitle>
                        <CardDescription suppressHydrationWarning>
                            {t('booking:proceed_to_payment')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {booking && (
                            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                                <p className="font-medium">
                                    <span suppressHydrationWarning>
                                        {booking.type === 'PRESENCIAL' ? t('booking:presencial') : t('booking:online')}
                                        {booking.slot ? ` - ${new Date(booking.slot.date).toLocaleDateString(i18n.language)} ${booking.slot.time}` : ` - ${new Date(booking.createdAt).toLocaleDateString(i18n.language)}`}
                                    </span>
                                </p>
                                <p className="text-xl font-bold mt-2" suppressHydrationWarning>
                                    {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: booking.currency || 'EUR' }).format((booking.totalAmount || 0) / 100)}
                                </p>
                            </div>
                        )}
                        {clientSecret && clientSecret.startsWith('mock_secret_') ? (
                            <MockPaymentForm bookingId={params.id as string} clientSecret={clientSecret} />
                        ) : clientSecret ? (
                            <Elements options={options as any} stripe={getStripe()}>
                                <CheckoutForm bookingId={params.id as string} amount={booking?.totalAmount || 0} />
                            </Elements>
                        ) : null}
                        {!clientSecret && !error && (
                            <div className="flex justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
