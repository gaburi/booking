'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MockPaymentForm({ bookingId, clientSecret }: { bookingId: string, clientSecret: string }) {
    const router = useRouter();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Extract mock payment intent id from the secret we constructed
            // format: mock_secret_pi_mock_123...
            const paymentIntentId = clientSecret.replace('mock_secret_', '');

            const res = await fetch('/api/confirm-mock-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, paymentIntentId })
            });

            if (res.ok) {
                router.push(`/booking/confirmation/${bookingId}`);
            } else {
                alert(t('booking:payment_failed'));
            }
        } catch (err) {
            console.error(err);
            alert(t('booking:payment_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 border-2 border-dashed border-yellow-400 p-6 rounded-md bg-yellow-50 dark:bg-yellow-900/10">
            <div className="text-center space-y-2">
                <h3 className="font-bold text-yellow-700 dark:text-yellow-500" suppressHydrationWarning>
                    {t('booking:mock_payment_title')}
                </h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400" suppressHydrationWarning>
                    {t('booking:mock_payment_description')}
                </p>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
                <div>
                    <Label suppressHydrationWarning>{t('booking:card_number_simulated')}</Label>
                    <Input value="4242 4242 4242 4242" disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label suppressHydrationWarning>{t('booking:expiry_date')}</Label>
                        <Input value="12/30" disabled />
                    </div>
                    <div>
                        <Label>CVC</Label>
                        <Input value="123" disabled />
                    </div>
                </div>

                <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    disabled={loading}
                    suppressHydrationWarning
                >
                    {loading ? t('booking:processing') : t('booking:pay_simulation')}
                </Button>
            </form>
        </div>
    );
}
