'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, Clock, Package, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Verify payment before showing success
    const verifyPayment = async () => {
      try {
        // Get payment_intent from URL (Stripe redirects with this)
        const paymentIntentId = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

        if (!paymentIntentId) {
          setError('No payment information found. Please contact support if you completed a payment.');
          setVerifying(false);
          return;
        }

        // Verify payment status with backend
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            clientSecret: paymentIntentClientSecret,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment verification failed');
        }

        if (data.status === 'succeeded') {
          setPaymentVerified(true);
          setOrderDetails(data);

          // Track Google Ads conversion
          if (typeof window !== 'undefined' && (window as any).gtag) {
            try {
              (window as any).gtag('event', 'conversion', {
                'send_to': 'AW-17682444096',
                'value': data.amount ? data.amount / 100 : 0,
                'currency': data.currency?.toUpperCase() || 'USD',
                'transaction_id': paymentIntentId
              });
              console.log('Google Ads conversion tracked');
            } catch (error) {
              console.error('Error tracking Google Ads conversion:', error);
            }
          }
        } else {
          setError(`Payment status: ${data.status}. Please contact support if you were charged.`);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Unable to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#262626] mb-4">
              Verifying Your Payment...
            </h1>
            <p className="text-lg text-gray-600">
              Please wait while we confirm your order.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !paymentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#262626] mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {error || 'We could not verify your payment.'}
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-[#262626] mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you believe you completed a payment, please contact us:
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  📧 <a href="mailto:support@hoodfair.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@hoodfair.com
                  </a>
                </p>
                <p className="text-gray-700">
                  📞 <a href="tel:+17176484487" className="text-blue-600 hover:text-blue-700 font-medium">
                    +1 (717) 648-4487
                  </a>
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2658A6] hover:bg-[#1a3d70] text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state (only shown if payment verified)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#262626] mb-4">
            Thank You for Your Order!
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Your payment has been confirmed and your order is being processed.
            We&apos;re excited to get your items ready for shipping!
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-500 mb-2">Order ID</p>
              <p className="text-lg font-mono font-semibold text-[#262626] mb-4">
                {orderDetails.paymentIntentId}
              </p>
              {orderDetails.amount && (
                <p className="text-2xl font-bold text-green-600">
                  ${(orderDetails.amount / 100).toFixed(2)} {orderDetails.currency?.toUpperCase()}
                </p>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">
              What happens next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#262626]">Order Processing</h3>
                  <p className="text-sm text-gray-600">We&apos;ll process your order within 24-48 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#262626]">Email Confirmation</h3>
                  <p className="text-sm text-gray-600">You&apos;ll receive an email with your order details and tracking number</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#262626]">Shipping</h3>
                  <p className="text-sm text-gray-600">Your order will ship within 5-8 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-[#262626] mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you have any questions about your order, don&apos;t hesitate to reach out:
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                📧 <a href="mailto:support@hoodfair.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@hoodfair.com
                </a>
              </p>
              <p className="text-gray-700">
                📞 <a href="tel:+17176484487" className="text-blue-600 hover:text-blue-700 font-medium">
                  +1 (717) 648-4487
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2658A6] hover:bg-[#1a3d70] text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your email address
          </p>
        </div>
      </div>
    </div>
  );
} 