'use client';

import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function CheckoutForm({ bookingId, amount }: { bookingId: string, amount: number }) {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking/confirmation/${bookingId}`,
            },
        });

        if (error.type === 'card_error' || error.type === 'validation_error') {
            setMessage(error.message || 'An unexpected error occurred.');
        } else {
            setMessage('An unexpected error occurred.');
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            {message && <div id="payment-message" className="text-red-500 text-sm">{message}</div>}
            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        {t('booking:processing')}
                    </div>
                ) : (
                    t('booking:pay_button')
                )}
            </Button>
        </form>
    );
}
