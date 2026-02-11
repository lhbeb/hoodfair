import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { product, shippingData } = body;

        // Validate required data
        if (!product || !shippingData) {
            return NextResponse.json(
                { error: 'Missing required data: product or shippingData' },
                { status: 400 }
            );
        }

        // Get the base URL for success/cancel redirects
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: product.currency?.toLowerCase() || 'usd',
                        product_data: {
                            name: product.title,
                            description: `Product ID: ${product.slug}`,
                            images: product.images && product.images.length > 0 ? [product.images[0]] : undefined,
                        },
                        unit_amount: Math.round(product.price * 100), // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/thankyou?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout`,
            customer_email: shippingData.email,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'CY', 'MT', 'LU'],
            },
            metadata: {
                product_slug: product.slug,
                product_id: product.id,
                shipping_address: shippingData.streetAddress,
                shipping_city: shippingData.city,
                shipping_state: shippingData.state,
                shipping_zip: shippingData.zipCode,
                customer_email: shippingData.email,
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
