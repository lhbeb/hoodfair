import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { product, shippingData } = body;

        // Validate required fields
        if (!product || !shippingData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Calculate amount in cents (Stripe uses smallest currency unit)
        const amount = Math.round(product.price * 100);

        // Create a Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: (product.currency || 'USD').toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                product_id: product.id,
                product_slug: product.slug,
                product_title: product.title,
                customer_email: shippingData.email,
                shipping_address: `${shippingData.streetAddress}, ${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}`,
            },
            description: `Order for ${product.title}`,
            shipping: {
                name: shippingData.email.split('@')[0], // Use email username as name
                address: {
                    line1: shippingData.streetAddress,
                    city: shippingData.city,
                    state: shippingData.state,
                    postal_code: shippingData.zipCode,
                    country: 'US', // You might want to make this dynamic
                },
            },
            receipt_email: shippingData.email,
        });

        console.log('✅ Payment Intent created:', paymentIntent.id);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error: any) {
        console.error('❌ Error creating payment intent:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}
