"use client";

import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
        // Animate the "preparing invoice" dot
        const interval = setInterval(() => setDotStep(s => (s + 1) % 4), 500);
        return () => { clearTimeout(t); clearInterval(interval); };
    }, []);

    const dots = ['', '.', '..', '...'];

    return (
        <div
            className={`flex flex-col items-center justify-center min-h-screen bg-[#0d1523] px-6 py-12 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* ── PAYPAL EMBLEM ── */}
            <div className="mb-8 relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-[#003087]/30 blur-xl scale-150" />
                <div className="relative w-20 h-20 rounded-full bg-[#003087] flex items-center justify-center shadow-2xl">
                    <span className="text-white font-black text-3xl select-none tracking-tight">P</span>
                </div>
            </div>

            {/* ── HEADLINE ── */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight leading-tight mb-3">
                Your order is reserved.
            </h1>

            {/* ── SUBTITLE ── */}
            <p className="text-[#8ba3c4] text-center text-base max-w-xs leading-relaxed mb-10">
                We&apos;re preparing your PayPal invoice{dots[dotStep]}<br />
                It&apos;s heading to{' '}
                <span className="text-white font-semibold">{shippingData.email}</span>
            </p>

            {/* ── DIVIDER ── */}
            <div className="w-full max-w-xs mb-8">
                <div className="h-px bg-white/10" />
            </div>

            {/* ── WHAT'S NEXT — minimal, two lines ── */}
            <div className="w-full max-w-xs flex flex-col gap-5 mb-10">
                <div className="flex items-start gap-4">
                    <span className="text-xl flex-shrink-0 mt-0.5">📩</span>
                    <div>
                        <p className="text-white text-sm font-semibold leading-snug">Check your inbox</p>
                        <p className="text-[#8ba3c4] text-xs mt-0.5 leading-relaxed">
                            Open the PayPal invoice — tap <strong className="text-white">Pay Now</strong>. That&apos;s it.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <span className="text-xl flex-shrink-0 mt-0.5">📦</span>
                    <div>
                        <p className="text-white text-sm font-semibold leading-snug">We ship instantly</p>
                        <p className="text-[#8ba3c4] text-xs mt-0.5 leading-relaxed">
                            Once payment lands, <span className="text-white">{product.title}</span> ships to your door.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── ORDER AMOUNT LINE ── */}
            <div className="w-full max-w-xs flex items-center justify-between mb-8 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[#8ba3c4] text-xs">Invoice amount</span>
                <span className="text-white font-bold text-base">{currencySymbol}{product.price.toFixed(2)}</span>
            </div>

            {/* ── CTA ── */}
            <button
                onClick={onClose}
                className="w-full max-w-xs py-4 px-6 bg-white hover:bg-gray-100 active:scale-[0.98] text-[#0d1523] font-bold rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5 shadow-xl"
            >
                Continue Shopping
                <ChevronRight className="h-4 w-4" />
            </button>

            {/* ── FOOTER NOTE ── */}
            <p className="mt-6 text-[10px] text-[#8ba3c4]/60 text-center max-w-xs">
                Questions? <a href="mailto:support@hoodfair.com" className="underline text-[#8ba3c4] hover:text-white transition-colors">support@hoodfair.com</a>
            </p>
        </div>
    );
}
