"use client";

import React, { useState, useEffect } from 'react';
import { Check, MapPin, Mail, CreditCard, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripeCheckoutProps {
    product: {
        id: string;
        slug: string;
        title: string;
        price: number;
        currency: string;
        images: string[];
    };
    shippingData: {
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
        email: string;
    };
    onClose?: () => void;
}

// Initialize Stripe with public key from environment
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Payment Form Component (inside Elements provider)
function PaymentForm({ product, shippingData, onClose }: StripeCheckoutProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please wait.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Confirm the payment
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message);
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/thankyou`,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                throw new Error(confirmError.message);
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                setPaymentSuccess(true);
                // Clear cart and redirect after a short delay
                setTimeout(() => {
                    if (onClose) onClose();
                    window.location.href = '/thankyou';
                }, 2000);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (paymentSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#262626] mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Redirecting to confirmation page...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Element */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#262626] mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#2658A6]" />
                    Payment Details
                </h3>
                <PaymentElement />
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-[#635BFF] hover:bg-[#5851EA] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing Payment...</span>
                    </>
                ) : (
                    <>
                        <CreditCard className="h-5 w-5" />
                        <span>Pay ${product.price.toFixed(2)} {product.currency}</span>
                    </>
                )}
            </button>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center justify-center bg-gray-100 rounded-full p-1">
                        <svg className="h-3 w-3 sm:h-4 sm:w-4 text-[#2658A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect width="18" height="12" x="3" y="8" rx="2" />
                            <path d="M7 8V6a5 5 0 0 1 10 0v2" />
                        </svg>
                    </span>
                    <span className="whitespace-nowrap">Secure Payment</span>
                </div>
                <div className="text-gray-300">•</div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center justify-center bg-gray-100 rounded-full p-1">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[#2658A6]" />
                    </span>
                    <span className="whitespace-nowrap">SSL Encrypted</span>
                </div>
                <div className="text-gray-300">•</div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center justify-center bg-gray-100 rounded-full p-1">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-[#2658A6]" />
                    </span>
                    <span className="whitespace-nowrap">Powered by Stripe</span>
                </div>
            </div>
        </form>
    );
}

// Main Component with Elements Provider
export default function StripeCheckout({ product, shippingData, onClose }: StripeCheckoutProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);

        // Create Payment Intent
        const createPaymentIntent = async () => {
            try {
                const response = await fetch('/api/create-stripe-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        product: {
                            id: product.id,
                            slug: product.slug,
                            title: product.title,
                            price: product.price,
                            currency: product.currency,
                        },
                        shippingData,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to initialize payment');
                }

                setClientSecret(data.clientSecret);
                setLoading(false);
            } catch (err) {
                console.error('Payment initialization error:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize payment');
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [product, shippingData]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#2658A6',
            colorBackground: '#ffffff',
            colorText: '#262626',
            colorDanger: '#df1b41',
            fontFamily: 'Roboto, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#f0fdfa] px-0 sm:px-2 pt-0 sm:pt-8 sm:pb-8 min-h-screen">
            <div className="bg-white/95 backdrop-blur-lg rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-gray-100 w-full max-w-5xl mx-auto transition-all duration-500">

                {/* Header with Address Confirmation */}
                <div className="p-6 sm:p-8 border-b border-gray-100">
                    <div className="flex items-center justify-center mb-4">
                        <div className="flex flex-col items-center flex-1">
                            <div className="flex flex-col items-center mb-2">
                                <span className="inline-flex items-center justify-center bg-blue-100 rounded-full p-2 mb-2">
                                    <Check className="h-7 w-7 text-[#2658A6]" />
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#262626] tracking-tight text-center">
                                    Complete Your Payment
                                </h2>
                            </div>
                            <p className="text-base sm:text-lg text-gray-700 text-center">
                                Your order will be shipped to the address below
                            </p>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="w-full flex flex-col lg:flex-row gap-4">
                        {/* Address Section */}
                        <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-5 w-5 text-[#2658A6]" />
                                <span className="font-semibold text-[#2658A6] text-base">Delivery Address</span>
                            </div>
                            <div className="text-gray-800 text-base whitespace-pre-line leading-relaxed">
                                {shippingData.streetAddress && <div>{shippingData.streetAddress}</div>}
                                {shippingData.city && <div>{shippingData.city}</div>}
                                {shippingData.state || shippingData.zipCode ? (
                                    <div>{shippingData.state}{shippingData.state && shippingData.zipCode ? ', ' : ''}{shippingData.zipCode}</div>
                                ) : null}
                            </div>
                        </div>

                        {/* Email Section */}
                        <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl shadow-sm p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Mail className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-600 text-base">Email Address</span>
                            </div>
                            <div className="text-gray-800 text-base">
                                {shippingData.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Summary */}
                <div className="p-6 sm:p-8 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-[#262626] mb-4">Order Summary</h3>
                    <div className="flex items-center gap-4">
                        {product.images && product.images[0] && (
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h4 className="font-semibold text-[#262626]">{product.title}</h4>
                            <p className="text-2xl font-bold text-[#2658A6] mt-1">
                                ${product.price.toFixed(2)} {product.currency}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="p-6 sm:p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 text-[#2658A6] animate-spin mb-4" />
                            <p className="text-gray-600">Initializing secure payment...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                            <PaymentForm product={product} shippingData={shippingData} onClose={onClose} />
                        </Elements>
                    ) : null}

                    {/* Stripe Logo */}
                    <div className="mt-6 flex justify-center">
                        <div className="text-gray-400 text-xs flex items-center gap-2">
                            <span>Secured by</span>
                            <svg className="h-6" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
