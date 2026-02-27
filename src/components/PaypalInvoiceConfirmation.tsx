"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, Lock, ChevronRight } from 'lucide-react';

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
    const scriptInjected = useRef(false);
    const currencySymbol = product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';

    // Derive a readable customer name from the email (e.g. "john.doe@..." → "John Doe")
    const customerName = shippingData.email
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()) || 'Customer';

    // Generate a deterministic order ID for this session
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const orderTotal = `${currencySymbol}${product.price.toFixed(2)}`;

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    // Inject widget.js AFTER first render — div is guaranteed in the DOM by then
    useEffect(() => {
        // 1. Set global config FIRST
        (window as any).HFChatConfig = {
            chatUrl: 'https://chatapppay.vercel.app',
            target: '#chat-widget',
            customerName: customerName,
            customerEmail: shippingData.email,
            orderId: orderId,
            total: orderTotal,
        };

        // 2. 100ms delay — ensures React has committed #chat-widget to the DOM
        const timer = setTimeout(() => {
            const script = document.createElement('script');
            script.src = 'https://chatapppay.vercel.app/widget.js';
            script.async = true;
            document.body.appendChild(script);
        }, 100);

        return () => {
            clearTimeout(timer);
            const existing = document.querySelector('script[src="https://chatapppay.vercel.app/widget.js"]');
            if (existing && document.body.contains(existing)) {
                document.body.removeChild(existing);
            }
            delete (window as any).HFChatConfig;
        };
    }, []); // empty deps — runs once after first render only

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 pt-8 pb-12">
            <div className={`w-full max-w-lg transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                {/* MAIN CARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-1 w-full bg-[#2658A6]" />

                    <div className="p-5 sm:p-6">

                        {/* HEADER */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <img src="/paypal-incoice.webp" alt="PayPal" className="w-7 h-7 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold text-[#262626] leading-tight">Order Reserved</h1>
                                <p className="text-xs text-gray-500">Chat with our team below to complete your purchase</p>
                            </div>
                            <div className="ml-auto text-right flex-shrink-0">
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="text-base font-bold text-[#2658A6]">{orderTotal}</p>
                            </div>
                        </div>

                        {/* ADDRESS / EMAIL STRIP */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5 space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 text-[#2658A6] flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">
                                    {[shippingData.streetAddress, shippingData.city, shippingData.state, shippingData.zipCode]
                                        .filter(Boolean).join(', ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-[#2658A6] flex-shrink-0" />
                                <span className="text-[#2658A6] font-medium break-all">{shippingData.email}</span>
                            </div>
                            <p className="text-xs text-gray-500 pl-5">
                                A PayPal invoice will be sent to this email once confirmed by our team.
                            </p>
                        </div>

                        {/* LIVE CHAT WIDGET */}
                        <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm mb-4">
                            <div className="bg-blue-50 px-4 py-2.5 flex items-center gap-2 border-b border-blue-100">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-[#2658A6]">
                                    Live support - speak with our team to confirm your order
                                </span>
                            </div>
                            {/* widget.js mounts the chat UI inside this div */}
                            <div
                                id="chat-widget"
                                style={{ width: '100%', height: '600px', borderRadius: '0', overflow: 'hidden' }}
                            />
                        </div>

                        {/* DONE BUTTON */}
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5"
                        >
                            Done - Continue Shopping
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* SSL NOTICE */}
                        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
                            <Lock className="h-3 w-3 text-[#2658A6]" />
                            <span>Secured with SSL encryption</span>
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-center text-xs text-gray-400">
                    Questions?{' '}
                    <a href="mailto:support@hoodfair.com" className="text-[#2658A6] hover:underline">support@hoodfair.com</a>
                </p>
            </div>
        </div>
    );
}
