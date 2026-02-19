"use client";

import React from 'react';
import { Check, MapPin, Mail, ShoppingBag } from 'lucide-react';

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
    const currencySymbol = product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#f0fdfa] px-4 py-8 sm:py-16">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg mx-auto overflow-hidden">

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100">
                    <div className="flex flex-col items-center mb-6">
                        {/* Success icon */}
                        <span className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-3">
                            <Check className="h-8 w-8 text-green-600" strokeWidth={2.5} />
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#262626] tracking-tight text-center">
                            Order Confirmed
                        </h2>
                        <p className="mt-1 text-base text-gray-500 text-center">
                            Pending payment via PayPal Invoice
                        </p>
                    </div>

                    {/* PayPal Invoice info banner */}
                    <div className="bg-[#003087]/5 border border-[#003087]/15 rounded-2xl p-4 flex items-start gap-3 mb-5">
                        {/* PayPal "P" badge */}
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#003087] text-white font-extrabold text-lg select-none">
                            P
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-[#003087] mb-0.5">PayPal Invoice on its way</p>
                            <p className="text-sm text-gray-700">
                                A PayPal invoice will be sent to{' '}
                                <span className="font-semibold text-[#003087] break-all">{shippingData.email}</span>.
                                Please complete the payment to confirm your shipment.
                            </p>
                        </div>
                    </div>

                    {/* Order summary row */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-5">
                        <ShoppingBag className="h-5 w-5 text-[#2658A6] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#262626] truncate">{product.title}</p>
                            <p className="text-xs text-gray-500">1 item</p>
                        </div>
                        <span className="text-base font-bold text-[#2658A6] flex-shrink-0">
                            {currencySymbol}{product.price.toFixed(2)}
                        </span>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-[#2658A6]" />
                            <span className="text-sm font-semibold text-[#2658A6]">Confirmed Delivery Address</span>
                        </div>
                        <div className="text-sm text-gray-800 leading-relaxed space-y-0.5">
                            {shippingData.streetAddress && <div>{shippingData.streetAddress}</div>}
                            {shippingData.city && <div>{shippingData.city}</div>}
                            {(shippingData.state || shippingData.zipCode) && (
                                <div>
                                    {shippingData.state}
                                    {shippingData.state && shippingData.zipCode ? ', ' : ''}
                                    {shippingData.zipCode}
                                </div>
                            )}
                        </div>
                        {shippingData.email && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100">
                                <Mail className="h-4 w-4 text-[#2658A6]" />
                                <span className="text-sm text-[#2658A6] break-all">{shippingData.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 flex flex-col items-center gap-4">
                    {/* What's next steps */}
                    <div className="w-full grid grid-cols-1 gap-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2658A6] text-white text-xs font-bold mt-0.5">1</span>
                            <span>Check your inbox at <strong>{shippingData.email}</strong> for a PayPal invoice.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2658A6] text-white text-xs font-bold mt-0.5">2</span>
                            <span>Complete the payment through PayPal.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2658A6] text-white text-xs font-bold mt-0.5">3</span>
                            <span>Once payment is confirmed, your order will be shipped to the address above.</span>
                        </div>
                    </div>

                    {/* SSL notice */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <svg className="h-4 w-4 text-[#2658A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect width="18" height="12" x="3" y="8" rx="2" />
                            <path d="M7 8V6a5 5 0 0 1 10 0v2" />
                        </svg>
                        <span>Your information is secured with SSL.</span>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={onClose}
                        className="w-full mt-2 py-3 px-6 bg-[#2658A6] hover:bg-[#1a3d70] text-white font-semibold rounded-xl transition-colors duration-200 text-base"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
