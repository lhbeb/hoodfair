"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Mail, ChevronRight, Lock } from 'lucide-react';

interface PaypalInvoiceConfirmationProps {
    shippingData: {
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
        email: string;
    };
    product: {
        title: string;
        price: number;
        currency?: string;
        images?: string[];
    };
    onClose?: () => void;
}

export default function PaypalInvoiceConfirmation({ shippingData, product, onClose }: PaypalInvoiceConfirmationProps) {
    const [visible, setVisible] = useState(false);
    const [dotStep, setDotStep] = useState(0);
    const currencySymbol = product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        const interval = setInterval(() => setDotStep(s => (s + 1) % 4), 500);
        return () => { clearTimeout(t); clearInterval(interval); };
    }, []);

    const dots = ['', '.', '..', '...'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <div
                className={`w-full max-w-md transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
                {/* ── MAIN CARD ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Top accent bar — brand blue */}
                    <div className="h-1 w-full bg-[#2658A6]" />

                    <div className="p-6 sm:p-8">

                        {/* ── LOGO + HEADLINE ── */}
                        <div className="flex flex-col items-center mb-7">
                            <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4 overflow-hidden">
                                <img
                                    src="/paypal-incoice.webp"
                                    alt="PayPal Invoice"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] tracking-tight text-center leading-tight">
                                Order Reserved
                            </h1>
                            <p className="mt-2 text-sm text-gray-500 text-center">
                                Preparing your PayPal invoice{dots[dotStep]}
                            </p>
                        </div>

                        {/* ── PAYPAL INVOICE NOTICE ── */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border border-blue-100 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                                    <img
                                        src="/paypal-incoice.webp"
                                        alt="PayPal"
                                        className="w-5 h-5 object-contain"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#2658A6] mb-0.5">PayPal Invoice on its way</p>
                                    <p className="text-sm text-gray-600">
                                        A PayPal invoice is being sent to{' '}
                                        <span className="font-semibold text-[#2658A6] break-all">{shippingData.email}</span>.
                                        Open it and tap <strong>Pay Now</strong> to confirm your order.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── SHIPPING ADDRESS ── */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-[#2658A6]" />
                                <span className="text-sm font-semibold text-[#2658A6]">Confirmed Delivery Address</span>
                            </div>
                            <div className="text-sm text-gray-800 leading-relaxed space-y-0.5 pl-6">
                                {shippingData.streetAddress && <div>{shippingData.streetAddress}</div>}
                                {shippingData.city && (
                                    <div>
                                        {shippingData.city}
                                        {shippingData.state ? `, ${shippingData.state}` : ''}
                                        {shippingData.zipCode ? ` ${shippingData.zipCode}` : ''}
                                    </div>
                                )}
                            </div>
                            {shippingData.email && (
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100 pl-6">
                                    <Mail className="h-3.5 w-3.5 text-[#2658A6] flex-shrink-0" />
                                    <span className="text-sm text-[#2658A6] break-all">{shippingData.email}</span>
                                </div>
                            )}
                        </div>

                        {/* ── WHAT'S NEXT ── */}
                        <div className="mb-6 grid grid-cols-1 gap-3">
                            {[
                                { step: '1', text: <span>Check your inbox for a PayPal invoice at <strong>{shippingData.email}</strong></span> },
                                { step: '2', text: <span>Tap <strong>Pay Now</strong> to complete your payment via PayPal</span> },
                                { step: '3', text: <span>Once confirmed, <strong>{product.title}</strong> ships straight to your door</span> },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2658A6] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                        {step}
                                    </span>
                                    <span className="text-sm text-gray-600">{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── AMOUNT ROW ── */}
                        <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-6">
                            <span className="text-sm text-gray-500">Invoice amount</span>
                            <span className="text-base font-bold text-[#2658A6]">{currencySymbol}{product.price.toFixed(2)}</span>
                        </div>

                        {/* ── CTA ── */}
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 px-6 bg-[#2658A6] hover:bg-[#1a3d70] active:scale-[0.98] text-white font-bold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5"
                        >
                            Continue Shopping
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* ── SSL NOTICE ── */}
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                            <Lock className="h-3.5 w-3.5 text-[#2658A6]" />
                            <span>Your information is secured with SSL.</span>
                        </div>
                    </div>
                </div>

                {/* Support line below card */}
                <p className="mt-4 text-center text-xs text-gray-400">
                    Questions?{' '}
                    <a href="mailto:support@hoodfair.com" className="text-[#2658A6] hover:underline">
                        support@hoodfair.com
                    </a>
                </p>
            </div>
        </div>
    );
}
